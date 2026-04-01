import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { envs } from "src/config";

@Injectable()
export class jwtFunctions {
    constructor(
        private readonly jwt: JwtService
    ) { }

    generateTokens(userId: number) {
        const payload = { sub: userId }

        const accessToken = this.jwt.sign(payload, {
            secret: envs.JWT_SECRET,
            expiresIn: '15m'
        })

        const refreshToken = this.jwt.sign(payload, {
            secret: envs.JWT_REFRESH_SECRET,
            expiresIn: '7d'
        })

        return { accessToken, refreshToken }
    }

    generateResetToken(userId: number) {
        const payload = { sub: userId }
        const resetToken = this.jwt.sign(payload, {
            secret: envs.JWT_RESET_SECRET,
            expiresIn: '15m'
        })
        return resetToken
    }

    generateTempToken(userId: number) {
        const payload = { sub: userId };

        return this.jwt.sign(payload, {
            secret: envs.JWT_SECRET,
            expiresIn: '5m'
        })
    }
}