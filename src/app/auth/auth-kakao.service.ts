import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthType } from "src/models/enum";
import { UserEntity } from "src/models/user.entity";
import { Repository } from "typeorm";
import hashPassword from "./utils/hashPassword";
import { HttpService } from "@nestjs/axios";
import { LoaderEnv } from "src/config/loader";
import { KakaoIdentityEntity } from "src/models/kakao-identity.entity";

@Injectable()
export class AuthKakaoService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(KakaoIdentityEntity)
    private readonly kakaoRepo: Repository<KakaoIdentityEntity>,
    private jwtService: JwtService,
    private http: HttpService
  ) {}

  async kakaoLogout(uid: string): Promise<any> {
    const userData = await this.kakaoRepo.findOne({userId: uid})
    console.log(userData);

    if (userData) {
      const logout = this.http.post(`https://kapi.kakao.com/v1/user/logout`, {
        headers: {
          'Authorization': `KakaoAK ${LoaderEnv.envs.KAKAO_ADMIN_KEY}`
        }
      })

      if (logout) {
        await this.kakaoRepo.delete({userId: uid})
        await this.userRepo.delete({id: uid})

        return 'Success logout'
      }
    }
  }

  async kakaoLogin(req: any): Promise<any> {
    const {
      email,
      profile
    } = req.user.kakao_account
    let subId = "";

    // find user
    if(!req.user) {
      throw new NotFoundException("No User from KAKAO");
    }

    const userData = await this.userRepo.findOne({
      where: {
        email
      }
    })
    
    if (!userData) {
      const createUser = new UserEntity();
      createUser.name = profile.nickname;
      createUser.nickname = profile.nickname;
      createUser.email = email;
      createUser.dob = new Date();
      createUser.password = await hashPassword(email.toString());
      createUser.avatar = profile.profile_image_url;
      createUser.isVerified = true;
      createUser.authType = AuthType.kakao

      try {
        const saveUser = await this.userRepo.save(createUser);
        subId = saveUser.id

        if (saveUser) {
          const storeKakao = new KakaoIdentityEntity();
          storeKakao.accessToken = req.user.accessToken;
          storeKakao.kakaoUserId = req.user.userId,
          storeKakao.userId = subId

          const saveKakao = await this.kakaoRepo.save(storeKakao);

          if (storeKakao) {
            const jwtPayload = {
              sub: subId,
              email: saveUser.email,
            };
        
            const token = this.jwtService.sign(jwtPayload);
            return {
              message: 'Success Create User With KAKAO',
              accessToken: token,
              data: createUser,
            };
          }
        }
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException(error);
      } 
    }

    if (userData.authType !== AuthType.kakao) {
      throw new BadRequestException("User already registered with social media. Try login using email and password instead!");
    } 

    const jwtPayload = {
      sub: userData.id,
      email,
    };

    const token = this.jwtService.sign(jwtPayload);
    return {
      message: 'Success Login User With KAKAO',
      accessToken: token,
      kakaoAccessToken: req.user.accessToken
    };
  }
}