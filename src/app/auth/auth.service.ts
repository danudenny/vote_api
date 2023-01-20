import {
  BadRequestException,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/models/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthType } from 'src/models/enum';
import hashPassword from './utils/hashPassword';
import { checkDob, checkEmail, comparePassword } from './utils/validation';
import { MailService } from '../mail/mail.service';
import { LoaderEnv } from 'src/config/loader';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private jwtService: JwtService,
    private mailSvc: MailService
  ) {}

  
  private generateTokenJwt(sub: string, email: string) {
    const jwtPayload = {
      sub,
      email,
    };

    return this.jwtService.sign(jwtPayload);
  }

  async register(payload: RegisterDto): Promise<any> {
    await checkDob(payload.dob);

    const createUser = new UserEntity();
    createUser.name = payload.name;
    createUser.nickname = payload.nickname;
    createUser.email = payload.email;
    createUser.dob = payload.dob;
    createUser.password = await hashPassword(payload.password.toString());
    createUser.phone = payload.phone;
    createUser.gender = payload.gender;

    try {
      const saveUser = await this.userRepo.save(createUser);
      if (saveUser) {
        const token = this.generateTokenJwt(saveUser.id, saveUser.email.toString())
        const url = `${LoaderEnv.envs.APP_URL}/auth/confirm?token=${token}`
        await this.mailSvc.sendConfirmationEmail(saveUser.name.toString(), saveUser.email.toString(), url)

        return {
          message: 'Success Create User',
          data: createUser,
        };
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async login(payload: LoginDto): Promise<any> {
    await checkEmail(payload.email.toString());
    const getUser = await this.userRepo.findOne({ 
      where : {
        email: payload.email
      }
    });

    if (getUser.authType !== AuthType.email) {
      throw new BadRequestException("Login Failed. Try login using Social Media instead!")
    }

    if (!getUser.isVerified) {
      throw new BadRequestException("Your account did not verified. Verified through email first!")
    }

    await comparePassword(
      payload.password.toString(),
      getUser.password.toString(),
    );

    const jwtPayload = {
      sub: getUser.id,
      email: getUser.email,
    };

    const token = this.jwtService.sign(jwtPayload);

    return {
      message: 'Login Success',
      access_token: token,
      data: getUser,
    };
  }

  async profile(id: string): Promise<UserEntity> {
    return await this.userRepo.findOne(id);
  }

  async validateUser(payload: LoginDto): Promise<any> {
    const user = await this.userRepo.findOne(payload.email);
    if (user && user.password === payload.password) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  
}
