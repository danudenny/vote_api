import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "@superfaceai/passport-twitter-oauth2";
import { LoaderEnv } from "src/config/loader";

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
    constructor() {
        super({
            clientType: LoaderEnv.envs.TWITTER_CLIENT_TYPE,
            clientID: LoaderEnv.envs.TWITTER_CLIENT_ID,
            clientSecret: LoaderEnv.envs.TWITTER_CLIENT_SECRETT,
            callbackURL: LoaderEnv.envs.TWITTER_CALLBACK_URL,
            scope: ['tweet.read', 'users.read', 'offline.access']
        })
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any
    ): Promise<any> {
        const user = {
            ...profile._json,
            accessToken,
            refreshToken
        }
        done(null, user)
    }
}