import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-kakao";
import { LoaderEnv } from "src/config/loader";

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
    constructor() {
        super({
            clientID: LoaderEnv.envs.KAKAO_CLIENT_ID,
            clientSecret: LoaderEnv.envs.KAKAO_SECRET_ID,
            callbackURL: `${LoaderEnv.envs.APP_URL}/auth${LoaderEnv.envs.KAKAO_CALLBACK_URL}`,
            scope: ['profile_nickname', 'profile_image', 'account_email']
        })
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any
    ): Promise<any> {                
        const userData = {
            ...profile._json,
            userId: profile.id,
            accessToken,
            refreshToken
        }
        done(null, userData)
    }
}