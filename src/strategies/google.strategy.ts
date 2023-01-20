import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { LoaderEnv } from "src/config/loader";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: LoaderEnv.envs.GOOGLE_CLIENT_ID,
            clientSecret: LoaderEnv.envs.GOOGLE_SECRET_ID,
            callbackURL: `${LoaderEnv.envs.APP_URL}/auth${LoaderEnv.envs.GOOGLE_CALLBACK_URL}`,
            scope: ['email', 'profile']
        })
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback
    ): Promise<any> {
        done(null, profile._json)
    }
}