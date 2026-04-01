import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { envs } from "src/config";

@Injectable()
export class ResetStrategy extends PassportStrategy(Strategy, 'jwt-reset') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: envs.JWT_RESET_SECRET
        })
    }

    validate(payload: { sub: number }) {
        return { userId: payload.sub }
    }
}