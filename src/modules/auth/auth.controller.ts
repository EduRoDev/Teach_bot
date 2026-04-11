import { Body, Controller, Get, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { RefreshGuard } from './guards/refresh.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { setRefreshCookie, setSessionCookie } from 'src/common/const';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { VerifyResetDto } from './dto/verifyReset.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { LoginDto } from './dto/login.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { GoogleAuthGuard } from './guards/google.guard';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRoleEnum } from '@prisma/client';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly service: AuthService
    ) { }

    @Post('register')
    async register(
        @Body() { name, lastName, email, password }: RegisterDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const { accessToken, refreshToken, sessionId } = await this.service.register(name, lastName, email, password, req.headers['user-agent'], req.ip);
        setRefreshCookie(res, refreshToken)
        setSessionCookie(res, sessionId)
        return { accessToken }
    }

    @Post('login')
    @Throttle({ default: { ttl: 60000, limit: 5 } })
    async login(
        @Body() { email, password }: LoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.service.login(email, password, req.headers['user-agent'], req.ip);

        if (result.twoFactorRequired) return { tempToken: result.tempToken, twoFactorRequired: true }
        if (result.refreshToken) setRefreshCookie(res, result.refreshToken);
        if (result.sessionId) setSessionCookie(res, result.sessionId);

        return { accessToken: result.accessToken }
    }

    @UseGuards(RefreshGuard)
    @Post('refresh')
    async refreshToken(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const { userId, sessionId } = req.user as { userId: number, sessionId: string };
        const refreshToken = req.cookies?.refreshToken;

        const {
            accessToken,
            refreshToken: newRefreshToken
        } = await this.service.refreshToken(userId, sessionId, refreshToken);

        setRefreshCookie(res, newRefreshToken)
        setSessionCookie(res, sessionId)

        return { accessToken }
    }

    @UseGuards(JwtAuthGuard)
    @Post('Logout')
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const { userId } = req.user as { userId: number };
        const sessionId = req.cookies?.sessionId;
        await this.service.logout(userId, sessionId);

        res.clearCookie('refreshToken');
        res.clearCookie('sessionId');

        return { message: 'Successfully logged out' };
    }


    @UseGuards(JwtAuthGuard)
    @Post('send-verify-email')
    async sendVerifyEmail(
        @Req() req: Request
    ) {
        const { userId } = req.user as { userId: number };
        return await this.service.sendVerifyEmail(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('verify-email')
    async verifyEmail(
        @Req() req: Request,
        @Body() dto: VerifyOtpDto
    ) {
        const { userId } = req.user as { userId: number };
        return await this.service.verifyEmail(userId, dto.otp);
    }

    @Post('forgot-password')
    @Throttle({ default: { ttl: 60000, limit: 5 } })
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return await this.service.forgotPassword(dto.email);
    }

    @Post('verify-reset-otp')
    @Throttle({ default: { ttl: 60000, limit: 5 } })
    async verifyResetOtp(@Body() dto: VerifyResetDto) {
        return await this.service.verifyResetOtp(dto.email, dto.otp);
    }

    @UseGuards(RefreshGuard)
    @Put('reset-password')
    async resetPassword(
        @Req() req: Request,
        @Body() dto: ResetPasswordDto
    ) {
        const { userId } = req.user as { userId: number };
        return await this.service.resetPassword(userId, dto.password);
    }

    @UseGuards(JwtAuthGuard)
    @Post('2fa/generate')
    async generate2FA(@Req() req: Request) {
        const { userId } = req.user as { userId: number };
        return await this.service.generate2FA(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('2fa/enable')
    async enable2FA(
        @Req() req: Request,
        @Body() dto: VerifyOtpDto
    ) {
        const { userId } = req.user as { userId: number };
        return await this.service.enable2FA(userId, dto.otp);
    }

    @Post('2fa/verify')
    @Throttle({ default: { ttl: 60000, limit: 5 } })
    async verify2FA(
        @Body() dto: Verify2FADto,
        @Res({ passthrough: true }) res: Response
    ) {
        const { accessToken, refreshToken, sessionId } = await this.service.verify2FA(dto.tempToken, dto.code);

        setRefreshCookie(res, refreshToken)
        setSessionCookie(res, sessionId)
        return { accessToken }
    }

    @UseGuards(GoogleAuthGuard)
    @SkipThrottle()
    @Get('google')
    async googleAuth() { }

    @UseGuards(GoogleAuthGuard)
    @SkipThrottle()
    @Get('google/callback')
    async googleAuthRedirect(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = req.user as {
            email: string,
            name: string,
            lastName: string,
            avatar: string
        };
        const { accessToken, refreshToken, sessionId } = await this.service.googleLogin(user);
        setRefreshCookie(res, refreshToken)
        setSessionCookie(res, sessionId)
        return { accessToken }
        // return res.redirect(`${envs.CLIENT_URL}?accessToken=${accessToken}`)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoleEnum.ADMIN)
    @Get('admin/ping')
    adminPing() {
        return { message: 'Admin access granted' }
    }
}