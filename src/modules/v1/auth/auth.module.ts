import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtRefreshTokenStrategy } from './strategy/jwt-refresh-token.strategy';
import { UserModule } from '../user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_TOKEN_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
