import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-kakao";
import { LoaderEnv } from "src/config/loader";

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
    constructor() {
        super(LoaderEnv.kakaoStrategy())
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