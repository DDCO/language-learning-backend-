import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleTokenService {
  private client = new OAuth2Client();

  async verifyIdToken(idToken: string) {
    const audiences = [
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_ANDROID_CLIENT_ID,
      process.env.GOOGLE_IOS_CLIENT_ID,
      ...(process.env.GOOGLE_CLIENT_IDS || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    ].filter(Boolean) as string[];

    if (!audiences.length) {
      throw new UnauthorizedException('Google OAuth audience is not configured');
    }

    let ticket;
    try {
      ticket = await this.client.verifyIdToken({
        idToken,
        audience: audiences,
      });
    } catch (error: any) {
      throw new UnauthorizedException(error?.message || 'Invalid Google ID token');
    }

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload?.email) {
      throw new UnauthorizedException('Invalid Google token payload');
    }

    return {
      id: payload.sub,
      emails: [{ value: payload.email }],
      name: {
        givenName: payload.given_name || 'Google',
        familyName: payload.family_name || 'User',
      },
    };
  }
}
