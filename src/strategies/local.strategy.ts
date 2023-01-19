import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../app/auth/auth.service';
import { LoginDto } from '../app/auth/dto/login.dto';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authSvc: AuthService) {
    super();
  }

  async validate(payload: LoginDto): Promise<any> {
    const user = this.authSvc.validateUser(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
