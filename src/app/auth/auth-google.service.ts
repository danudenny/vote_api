import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthType } from "src/models/enum";
import { UserEntity } from "src/models/user.entity";
import { Repository } from "typeorm";
import generateNickname from "./utils/generateNickname";
import hashPassword from "./utils/hashPassword";

@Injectable()
export class AuthGoogleService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private jwtService: JwtService
  ) {}

  async googleLogin(req: any) {
    const {name, email, picture} = req.user
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
      createUser.nickname = generateNickname(name);
      createUser.email = email;
      createUser.dob = new Date();
      createUser.password = await hashPassword(email.toString());
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
}