import { Injectable, Request } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { access } from 'fs';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}
  login(user: any) {
    const payload = {
      email: user.email,
      sub: { id: user.id, role: user.role },
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOne('email', email);
    console.log(user);

    if (user && user.password === password) {
      const { password, ...result } = user;
      return result;
    } //change this to a more secure approach
    return null;
  }
}
