import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/models/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthType } from 'src/models/enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  private async comparePassword(
    plain: string,
    hashed: string,
  ): Promise<boolean> {
    const compare = await bcrypt.compare(plain, hashed);
    if (!compare) throw new BadRequestException('Wrong Password!');
    return true;
  }

  private async checkDob(dob: Date): Promise<any> {
    const checkDate = new Date().getFullYear() - new Date(dob).getFullYear();
    if (checkDate < 12)
      throw new BadRequestException('Minimum age must be 12!');
  }

  private async checkEmail(email: string): Promise<boolean> {
    const getEmail = await this.userRepo.findOne({ email });
    if (!getEmail) throw new NotFoundException('Email not found');
    return true;
  }

  async register(payload: RegisterDto): Promise<any> {
    await this.checkDob(payload.dob);

    const createUser = new UserEntity();
    createUser.name = payload.name;
    createUser.nickname = payload.nickname;
    createUser.email = payload.email;
    createUser.dob = payload.dob;
    createUser.password = await this.hashPassword(payload.password.toString());
    createUser.phone = payload.phone;
    createUser.gender = payload.gender;

    try {
      const saveUser = await this.userRepo.save(createUser);
      if (saveUser) {
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
    await this.checkEmail(payload.email.toString());
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

    await this.comparePassword(
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

  // oauth
  async googleLogin(req: any) {
    const {sub, name, email, picture} = req.user
    let subId = "";

    // find user
    if(!req.user) {
      throw new NotFoundException("No User from google");
    }

    const getUserByType = await this.userRepo.findOne({
      where: {
        email
      }
    })
    
    if (!getUserByType) {
      const createUser = new UserEntity();
      createUser.name = name;
      createUser.nickname = this.generateNickName(name);
      createUser.email = email;
      createUser.dob = new Date();
      createUser.password = await this.hashPassword(email.toString());
      createUser.avatar = picture;
      createUser.isVerified = true;
      createUser.authType = AuthType.google

      try {
        const saveUser = await this.userRepo.save(createUser);
        subId = saveUser.id

        if (saveUser) {

          const jwtPayload = {
            sub: subId,
            email,
          };
      
          const token = this.jwtService.sign(jwtPayload);
          return {
            message: 'Success Create User With Google',
            accessToken: token,
            data: createUser,
          };
        }
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException(error);
      } 
    }

    if (getUserByType.authType !== AuthType.google) {
      throw new BadRequestException("User already registered with this email. Try login using email and password instead!");
    } 

    const jwtPayload = {
      sub: getUserByType.id,
      email,
    };

    const token = this.jwtService.sign(jwtPayload);
    return {
      message: 'Success Login User With Google',
      accessToken: token,
    };
  }
  

  private generateNickName(name: string): any {
    return name.split(" ").join("").toLowerCase();
  }
}
