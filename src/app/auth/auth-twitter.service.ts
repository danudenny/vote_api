import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthType } from "src/models/enum";
import { UserEntity } from "src/models/user.entity";
import { Repository } from "typeorm";
import hashPassword from "./utils/hashPassword";

@Injectable()
export class AuthTwitterService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private jwtService: JwtService
  ) {}

  async twitterLogin(req: any) {
    const {username, name, profile_image_url } = req.user
    let subId = "";
    console.log(req.user);
    

    // find user
    if(!req.user) {
      throw new NotFoundException("No User from twitter");
    }

    const userData = await this.userRepo.findOne({
      where: {
        nickname: username
      }
    })
    
    if (!userData) {
      const createUser = new UserEntity();
      createUser.name = name;
      createUser.nickname = username;
      createUser.email = `${username}@email.com`;
      createUser.dob = new Date();
      createUser.password = await hashPassword(username.toString());
      createUser.avatar = profile_image_url;
      createUser.isVerified = true;
      createUser.authType = AuthType.twitter

      try {
        const saveUser = await this.userRepo.save(createUser);
        subId = saveUser.id

        if (saveUser) {

          const jwtPayload = {
            sub: subId,
            email: saveUser.email,
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

    if (userData.authType !== AuthType.twitter) {
      throw new BadRequestException("User already registered with social media. Try login using email and password instead!");
    } 

    const jwtPayload = {
      sub: userData.id,
      email: `${username}@email.com`,
    };

    const token = this.jwtService.sign(jwtPayload);
    return {
      message: 'Success Login User With Twitter',
      accessToken: token,
    };
  }
}