import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { envs } from "src/config";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: envs.GOOGLE_CLIENT_ID,
            clientSecret: envs.GOOGLE_CLIENT_SECRET,
            callbackURL: envs.GOOGLE_CALLBACK_URL,
            scope: ['email', 'profile']
        })
    }

    validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
    ) {

        const { name, emails, photos } = profile;
        const user = {
            email: emails?.[0]?.value,
            name: name?.givenName,
            lastName: name?.familyName,
            avatar: photos?.[0]?.value,
            accessToken,
        }
        done(null, user)
    }

}