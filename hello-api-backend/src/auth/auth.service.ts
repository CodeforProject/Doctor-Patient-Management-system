import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async googleLogin(idToken: string) {
    // Verify token with Google
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

// ADD THIS CHECK
if (!payload || !payload.email || !payload.name) {
  throw new Error('Google token verification failed');
}

let user = await this.usersService.findByEmail(payload.email);


    if (!user) {
      // Create user if not exist
      user = await this.usersService.create({
        name: payload.name,
        email: payload.email,
        status: 'ACTIVE',
      });
    }

    // Generate JWT
    const token = this.jwtService.sign(
      { sub: user.user_id, email: user.email },
      { secret: process.env.JWT_SECRET, expiresIn: '7d' }
    );


    return { access_token: token };
  }
}
