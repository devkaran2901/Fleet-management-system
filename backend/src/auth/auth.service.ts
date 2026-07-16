import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    // Map UserRole objects to simple string array of role names
    const roleNames = user.roles.map((ur: any) => ur.role.name);
    
    const payload = {
      email: user.email,
      sub: user.id,
      roles: roleNames,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        roles: roleNames,
      },
    };
  }

  async register(data: any) {
    const user = await this.userService.create({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      roleNames: data.roles || ['DRIVER'], // Default to DRIVER role
    });

    // Fetch user with role details included for login response
    const completeUser = await this.userService.findByEmail(user.email);
    return this.login(completeUser);
  }
}
