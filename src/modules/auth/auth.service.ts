import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptService } from './bcrypt/bcrypt.service';
import { SessionsService } from './sessions/sessions.service';
import { JwtService } from '@nestjs/jwt';
import { envs } from 'src/config';
import { UsersService } from '../users/users.service';
import { v4 as uuidv4 } from 'uuid';
import { EmailsService } from '../emails/emails.service';
import { TokensService } from './tokens/tokens.service';
import { AuthorizationTokenEnum } from 'src/common/enums';
import { otpTemplate } from '../emails/views/otp.template';
import { jwtFunctions } from 'src/common/class/jwt.class';
import { generateSecret, generateURI, verify } from 'otplib';
import { toDataURL } from 'qrcode';
import { AuthProviderEnum, UserStatusEnum } from '@prisma/client';


@Injectable()
export class AuthService {
    constructor(
        private readonly bcrypt: BcryptService,
        private readonly sessions: SessionsService,
        private readonly users: UsersService,
        private readonly jwt: JwtService,
        private readonly jwtFunctions: jwtFunctions,
        private readonly emails: EmailsService,
        private readonly tokens: TokensService,
        private readonly prisma: PrismaService
    ) { }


    async register(name: string, lastName: string, email: string, password: string, userAgent?: string, ipAddress?: string) {
        const user = await this.users.create({
            name,
            lastName,
            email,
            password
        })

        const { accessToken, refreshToken } = this.jwtFunctions.generateTokens(user.id);

        const hashedRefreshToken = await this.bcrypt.hash(refreshToken);

        const session = await this.sessions.create({
            id: uuidv4(),
            userId: user.id,
            refreshToken: hashedRefreshToken,
            userAgent,
            ipAddress,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })

        return { accessToken, refreshToken, sessionId: session.id }
    }

    async login(email: string, password: string, userAgent?: string, ipAddress?: string) {
        const user = await this.users.findOne(undefined, email)

        if (!user.password) {
            throw new BadRequestException('Not password set for this user')
        }

        const passwordValid = await this.bcrypt.compare(password, user.password)

        if (!passwordValid) {
            throw new UnauthorizedException('Invalid credentials')
        }

        if (user.status !== UserStatusEnum.ACTIVE) throw new UnauthorizedException('User is not active')

        if (user.twoFactorEnabled) {
            const tempToken = this.jwtFunctions.generateTempToken(user.id)
            return { tempToken, twoFactorRequired: true }
        }

        const { accessToken, refreshToken } = this.jwtFunctions.generateTokens(user.id);

        const hashedRefreshToken = await this.bcrypt.hash(refreshToken);

        const session = await this.sessions.create({
            id: uuidv4(),
            userId: user.id,
            refreshToken: hashedRefreshToken,
            userAgent,
            ipAddress,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })

        return { accessToken, refreshToken, sessionId: session.id }
    }

    async refreshToken(
        userId: number,
        sessionId: string,
        refreshToken: string
    ) {
        const session = await this.sessions.findOne({ id: sessionId, userId })

        if (!session.isActive) throw new UnauthorizedException('Session is not active')

        const refreshTokenValid = await this.bcrypt.compare(refreshToken, session.refreshToken)
        if (!refreshTokenValid) throw new UnauthorizedException('Invalid refresh token')

        const { accessToken, refreshToken: newRefreshToken } = this.jwtFunctions.generateTokens(userId)

        const hashedRefreshToken = await this.bcrypt.hash(newRefreshToken)

        await this.sessions.update({
            id: sessionId,
            userId,
            refreshToken: hashedRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })

        return { accessToken, refreshToken: newRefreshToken }
    }

    async logout(userId: number, sessionId: string) {
        await this.sessions.delete({ id: sessionId, userId })
        return { message: 'Logged out successfully' }
    }

    async sendVerifyEmail(userId: number) {
        const user = await this.users.findOne(userId)

        if (user.emailConfirm) throw new BadRequestException('Email already verified')

        const otp = await this.tokens.generateToken({
            userId,
            type: AuthorizationTokenEnum.CONFIRM_EMAIL,
            ttl: 15 * 60 * 1000
        })

        await this.emails.sendEmail({
            subject: 'Verifica tu correo electrónico',
            html: otpTemplate(otp.token),
            to: ['solanoe934@gmail.com']
        })

        return { message: 'Verification email sent', status: 'success' }

    }

    async verifyEmail(userId: number, token: string) {
        await this.tokens.validateToken({
            userId,
            type: AuthorizationTokenEnum.CONFIRM_EMAIL,
            token
        })

        await this.users.update({
            id: userId,
            emailConfirm: true
        })

        await this.tokens.revokeToken({
            userId,
            type: AuthorizationTokenEnum.CONFIRM_EMAIL
        })

        return { message: 'Email verified successfully', status: 'success' }
    }


    async forgotPassword(email: string) {
        const user = await this.users.findOne(undefined, email)
        if (!user) throw new BadRequestException('User not found')

        const otp = await this.tokens.generateToken({
            userId: user.id,
            type: AuthorizationTokenEnum.RECOVERY_PASSWORD,
            ttl: 15 * 60 * 1000
        })

        await this.emails.sendEmail({
            to: [email],
            subject: 'Recuperación de contraseña',
            html: otpTemplate(otp.token)
        })

        return { message: 'Recovery email sent', status: 'success' }
    }

    async verifyResetOtp(email: string, otp: string) {
        const user = await this.users.findOne(undefined, email)
        if (!user) throw new BadRequestException('User not found')

        await this.tokens.validateToken({
            userId: user.id,
            type: AuthorizationTokenEnum.RECOVERY_PASSWORD,
            token: otp
        })

        const resetToken = this.jwtFunctions.generateResetToken(user.id)

        return { resetToken }
    }

    async resetPassword(userId: number, newPassword: string) {
        await this.users.update({
            id: userId,
            password: newPassword
        })

        await this.sessions.deleteAll({ userId })

        return { message: 'Password reset successfully', status: 'success' }
    }


    async generate2FA(userId: number) {
        const user = await this.users.findOne(userId)
        if (user.twoFactorEnabled) throw new BadRequestException('2FA already enabled')

        const secret = generateSecret();
        await this.users.update({
            id: userId,
            twoFactorSecret: secret
        })

        const otpAuth = generateURI({
            label: user.email,
            issuer: 'Teach Bot',
            secret,
        })

        const qrCode = await toDataURL(otpAuth)

        return { qrCode }
    }

    async enable2FA(userId: number, code: string) {
        const user = await this.users.findOne(userId)
        if (user.twoFactorEnabled) throw new BadRequestException('2FA already enabled')
        if (!user.twoFactorSecret) throw new BadRequestException('2FA not enabled')

        const isValid = verify({
            token: code,
            secret: user.twoFactorSecret
        })

        if (!isValid) throw new UnauthorizedException('Invalid 2FA code')

        await this.users.update({
            id: userId,
            twoFactorEnabled: true
        })
        return { message: '2FA enabled successfully', status: 'success' }
    }

    async verify2FA(tempToken: string, code: string) {
        let payload: { sub: number };

        try {
            payload = this.jwt.verify(tempToken, {
                secret: envs.JWT_SECRET
            })
        } catch (error) {
            throw new UnauthorizedException('Invalid token')
        }

        const user = await this.users.findOne(payload.sub)
        if (!user.twoFactorSecret) throw new BadRequestException('2FA secret not configured')

        const isValid = verify({
            token: code,
            secret: user.twoFactorSecret
        })

        if (!isValid) throw new UnauthorizedException('Invalid 2FA code')

        const { accessToken, refreshToken } = this.jwtFunctions.generateTokens(user.id);
        const hashedRefreshToken = await this.bcrypt.hash(refreshToken);
        const session = await this.sessions.create({
            id: uuidv4(),
            userId: user.id,
            refreshToken: hashedRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })

        return { accessToken, refreshToken, sessionId: session.id }
    }


    async googleLogin(googleUser: {
        email: string,
        name: string,
        lastName: string,
        avatar: string
    }) {
        let user = await this.prisma.user.findUnique({
            where: { email: googleUser.email }
        })
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: googleUser.email,
                    name: googleUser.name,
                    lastName: googleUser.lastName,
                    avatar: googleUser.avatar,
                    emailConfirm: true,
                    authProvider: AuthProviderEnum.GOOGLE
                }
            })
        }

        if (user.authProvider !== AuthProviderEnum.GOOGLE) {
            throw new BadRequestException('Email already registered with different authentication method')
        }

        if (user.status !== UserStatusEnum.ACTIVE) throw new UnauthorizedException('User is not active')

        const { accessToken, refreshToken } = this.jwtFunctions.generateTokens(user.id);
        const hashedRefreshToken = await this.bcrypt.hash(refreshToken);
        const session = await this.sessions.create({
            id: uuidv4(),
            userId: user.id,
            refreshToken: hashedRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })

        return { accessToken, refreshToken, sessionId: session.id }
    }

}
