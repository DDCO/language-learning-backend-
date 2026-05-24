import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

type GoogleProfile = {
  id: string;
  emails?: { value: string }[];
  name?: { givenName?: string; familyName?: string };
};

function safeJwtExpiresIn(value: string | undefined, fallback: string): string {
  const candidate = (value || '').trim();
  if (!candidate) return fallback;
  if (/^\d+$/.test(candidate)) return candidate;
  if (/^\d+\s*(ms|s|m|h|d|w|y)$/i.test(candidate)) return candidate.replace(/\s+/g, '');
  return fallback;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateGoogleUser(profile: GoogleProfile): Promise<User> {
    const email = profile.emails?.[0]?.value?.toLowerCase();
    if (!email) {
      throw new UnauthorizedException('Google profile did not include an email address');
    }

    let user = await this.usersRepository.findOne({
      where: [{ googleId: profile.id }, { email }],
    });

    if (!user) {
      user = this.usersRepository.create({
        email,
        googleId: profile.id,
        firstName: profile.name?.givenName || 'Google',
        lastName: profile.name?.familyName || 'User',
        password: null,
      });
    } else if (!user.googleId) {
      user.googleId = profile.id;
    }

    return this.usersRepository.save(user);
  }

  private createAccessToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
  }

  private createRefreshToken(user: User): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'refresh',
      },
      {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key-here',
        expiresIn: safeJwtExpiresIn(process.env.JWT_REFRESH_EXPIRATION, '30d') as any,
      },
    );
  }

  async issueTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.createAccessToken(user);
    const refreshToken = this.createRefreshToken(user);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.save(user);
    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: { sub: string; type?: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key-here',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token type');
    }

    const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token not recognized');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    return this.issueTokens(user);
  }

  async logout(userId: string): Promise<{ loggedOut: boolean }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    user.refreshTokenHash = null;
    await this.usersRepository.save(user);
    return { loggedOut: true };
  }
}
