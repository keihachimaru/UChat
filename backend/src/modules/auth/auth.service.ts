import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login-auth.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async login(googleUser : LoginDto) {
    const user = await this.usersService.findOrCreate(googleUser);

    return this.jwtService.sign({
      sub: user.providerId,
      email:  user.email,
    })
  }
}
