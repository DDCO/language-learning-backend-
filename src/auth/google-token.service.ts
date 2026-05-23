import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleTokenService {
  private client = new OAuth2Client();

  async verifyIdToken(idToken: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new UnauthorizedException('GOOGLE_CLIENT_ID is not set');
    }

    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: clientId,
    });

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
