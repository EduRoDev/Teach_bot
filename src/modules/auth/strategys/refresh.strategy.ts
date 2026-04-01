import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { envs } from 'src/config';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies?.refreshToken ?? null
            ]),

            ignoreExpiration: false,
            secretOrKey: envs.JWT_REFRESH_SECRET,
            passReqToCallback: true,
        });
    }

    // req lo tenemos porque pusimos passReqToCallback: true
    validate(req: Request, payload: { sub: number }) {
        const sessionId = req.cookies?.sessionId;

        return {
            userId: payload.sub,
            sessionId,
        };
    }
}