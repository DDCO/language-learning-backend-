import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { User } from '../entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { GoogleTokenService } from './google-token.service';

function safeJwtExpiresIn(value: string | undefined, fallback: string): string {
  const candidate = (value || '').trim();
  if (!candidate) return fallback;
  if (/^\d+$/.test(candidate)) return candidate;
  if (/^\d+\s*(ms|s|m|h|d|w|y)$/i.test(candidate)) return candidate.replace(/\s+/g, '');
  return fallback;
}

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-secret-key-here'),
        signOptions: {
          expiresIn: safeJwtExpiresIn(configService.get<string>('JWT_EXPIRATION'), '7d') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtStrategy, GoogleTokenService],
  exports: [AuthService],
})
export class AuthModule {}
