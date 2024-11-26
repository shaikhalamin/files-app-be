import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  private readonly logger = new Logger(JwtRefreshTokenStrategy.name);
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_TOKEN_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    try {
      const refreshToken = req
        .get('Authorization')
        .replace('Bearer', '')
        .trim();

      this.logger.log('refresh token payload ', payload);

      return { ...payload, refreshToken };
    } catch (error) {
      this.logger.log('error', error.message);

      return false;
    }
  }
}
