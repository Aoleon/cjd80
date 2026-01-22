import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(registerDto);

    // Set httpOnly cookie for Next.js frontend
    res.cookie('work_portal_sid', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return result;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);

    // Set httpOnly cookie for Next.js frontend
    res.cookie('work_portal_sid', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Public()
  @Get('user')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser() {
    // Public endpoint - returns null for unauthenticated users
    // Client should handle 401/null appropriately
    return { user: null };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Public()
  async logout(@Res({ passthrough: true }) res: Response) {
    // Clear the cookie
    res.clearCookie('work_portal_sid', { path: '/' });
    return { message: 'Déconnecté avec succès' };
  }
}
