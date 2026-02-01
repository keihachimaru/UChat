import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}
  
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res) {
    const jwt = await this.authService.login(req.user);
    console.log('Generated JWT');
    res.cookie('jwt', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
      path: '/',
    })

    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Req() req : 
    Request & { 
      user: { 
        providerId: string
        avatar: string
      }
    }) {
    return {
      providerId: req.user.providerId,
      avatar: req.user.avatar,
    };
  }
  
  @Get('logout')
  logout(@Res() res) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
    });

    return res.status(200).json({ message: 'Logged out' });
  }
}
