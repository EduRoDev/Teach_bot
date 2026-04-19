import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserRoleEnum } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { envs } from 'src/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: envs.JWT_SECRET,
        });
    }

    validate(payload: { sub: number; role: UserRoleEnum }) {
        return { userId: payload.sub, role: payload.role };
    }
}