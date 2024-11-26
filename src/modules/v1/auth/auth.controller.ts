import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login.response';
import { JwtRefreshAuthGuard } from './guard/jwt-refresh-auth.guard';
import { RequestUser } from './type/request-user';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { ResponseType } from '@/common/decorator/response-type.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    description: 'Login response',
    status: 200,
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password !' })
  @Post('/login')
  @ResponseType(LoginResponseDto)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/refresh')
  @ApiBearerAuth()
  @UseGuards(JwtRefreshAuthGuard)
  refresh(@Req() req: Request) {
    const userToken = req.user as RequestUser;

    return this.authService.refreshTokens(userToken);
  }

  @Post('/logout')
  @ApiBearerAuth()
  @UseGuards(JwtRefreshAuthGuard)
  logout() {
    return null;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/test-auth-route')
  findAll(@Req() req: Request) {
    return req.user;
  }
}
