import { Logger, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as ms from 'ms';
import { RequestUser } from './type/request-user';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UserResponseDto } from '../user/dto/user-respose.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private accessTokenExpireIn = '24h';

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const payload = {
      userId: user.id,
    };

    const transformedUser = plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
    return {
      access_token: this.getAccessToken(payload),
      refresh_token: this.getRefreshToken(payload),
      user: transformedUser,
      expires_at: this.getTokenExpireAt(),
    };
  }

  async refreshTokens(user: RequestUser): Promise<any> {
    const userInfo = await this.userService.findOne(user.userId);
    if (!userInfo) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    delete userInfo.password;
    const payload = {
      userId: user.userId,
    };

    const accessToken = this.getAccessToken(payload, this.accessTokenExpireIn);
    const refreshToken = this.getRefreshToken(payload);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: userInfo,
    };
  }

  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (!(await user?.validatePassword(password))) {
      throw new UnauthorizedException('Invalid email or password !');
    }
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userService.findOne(id);
    delete user.password;
    return user;
  }

  async validateToken(token: string): Promise<any> {
    try {
      const actualToken = token.replace('Bearer', '').trim();
      this.logger.log(`Validating token  ${actualToken}`);
      const decodedToken = await this.jwtService.verify(actualToken, {
        secret: this.configService.get<string>('JWT_TOKEN_SECRET'),
      });
      return decodedToken;
    } catch (error) {
      this.logger.log(`Token  invalid `);
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  getAccessToken(payload: any, tokenExpireAt?: string) {
    const expiresIn = tokenExpireAt ? tokenExpireAt : this.accessTokenExpireIn;

    return this.jwtService.sign(payload, {
      expiresIn: expiresIn,
      secret: this.configService.get<string>('JWT_TOKEN_SECRET'),
    });
  }

  generateToken(payload: any, tokenExpireAt?: string) {
    const expiresIn = tokenExpireAt ? tokenExpireAt : '30d';
    return this.jwtService.sign(payload, {
      expiresIn: expiresIn,
      secret: this.configService.get<string>('JWT_TOKEN_SECRET'),
    });
  }

  getRefreshToken(payload: any) {
    return this.jwtService.sign(payload, {
      expiresIn: '30d',
      secret: this.configService.get<string>('JWT_TOKEN_SECRET'),
    });
  }

  getTokenExpireAt(): number {
    const expireAt = Date.now() + ms(`${this.accessTokenExpireIn}`);
    return expireAt;
  }
}
