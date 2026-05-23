import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';

type GoogleProfile = {
  id: string;
  emails?: { value: string }[];
  name?: { givenName?: string; familyName?: string };
};

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
      throw new Error('Google profile did not include an email address');
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

  createJwt(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
  }
}
