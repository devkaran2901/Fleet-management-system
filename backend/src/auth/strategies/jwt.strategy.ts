import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fms_super_secret_jwt_key_2026',
    });
  }

  async validate(payload: any) {
    // The payload format returned is stored on req.user
    return { id: payload.sub, email: payload.email, roles: payload.roles };
  }
}
