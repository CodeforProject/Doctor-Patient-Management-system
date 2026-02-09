import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('google')
  async googleAuth(@Body('idToken') idToken: string | undefined) {
    if (!idToken) throw new Error('idToken is required');
    return this.authService.googleLogin(idToken);
  }

}
