import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthType } from 'src/models/enum';
import { UserEntity } from 'src/models/user.entity';
import { Repository } from 'typeorm';
import hashPassword from './utils/hashPassword';

@Injectable()
export class AuthKakaoService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async kakaoLogin(req: any): Promise<any> {
    const { email, profile } = req.user.kakao_account;
    let subId = '';

    // find user
    if (!req.user) {
      throw new NotFoundException('No User from KAKAO');
    }

    const userData = await this.userRepo.findOne({
      where: {
        email,
      },
    });

    if (!userData) {
      const createUser = new UserEntity();
      createUser.name = profile.nickname;
      createUser.nickname = profile.nickname;
      createUser.email = email;
      createUser.dob = new Date();
      createUser.password = await hashPassword(email.toString());
      createUser.avatar = profile.profile_image_url;
      createUser.isVerified = true;
      createUser.authType = AuthType.kakao;

      try {
        const saveUser = await this.userRepo.save(createUser);
        subId = saveUser.id;

        if (saveUser) {
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
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException(error);
      }
    }

    if (userData.authType !== AuthType.kakao) {
      throw new BadRequestException(
        'User already registered with social media. Try login using email and password instead!',
      );
    }

    const jwtPayload = {
      sub: userData.id,
      email,
    };

    const token = this.jwtService.sign(jwtPayload);
    return {
      message: 'Success Login User With KAKAO',
      accessToken: token,
      kakaoAccessToken: req.user.accessToken,
    };
  }
}
