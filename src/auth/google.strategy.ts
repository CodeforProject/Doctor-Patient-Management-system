import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      callbackURL: process.env.CALLBACK_URL!,
      scope: ['profile', 'email']
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const json = profile._json || {};
    const user = {
      googleId: json.id || profile.id || '',
      email: (json.emails && json.emails.length > 0) ? json.emails[0].value :
             (profile.emails && profile.emails.length > 0) ? profile.emails[0].value : '',
      name: json.displayName ||  // Fallback to displayName if name is missing
            (json.name ? `${json.name.givenName || ''} ${json.name.familyName || ''}`.trim() : '') ||
            profile.displayName || '',
    };
    done(null, user);
  }
}