import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserRoleEnum } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { envs } from 'src/config';
import { SessionsService } from '../sessions/sessions.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private sessions: SessionsService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: envs.JWT_SECRET,
            passReqToCallback: true,
        });
    }

    async validate(payload: { sub: number; role: UserRoleEnum }, req: Request) {
        const sessionId = req.cookies?.sessionId;
        if (!sessionId) throw new UnauthorizedException('Session ID not found in cookies');

        const session = await this.sessions.findOne({ id: sessionId, userId: payload.sub });
        if (!session.expiresAt || new Date(session.expiresAt) < new Date()) {
            throw new UnauthorizedException('Session has expired');
        }
        return { ...payload, sessionId }

    }
}