import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceToken } from '../entities/device-token.entity';

@Injectable()
export class DeviceTokenService {
  constructor(
    @InjectRepository(DeviceToken)
    private readonly repo: Repository<DeviceToken>,
  ) {}

  async register(userId: string, token: string, platform: 'android' | 'ios') {
    let existing = await this.repo.findOne({ where: { token } });

    if (!existing) {
      existing = this.repo.create({
        token,
        platform,
        isActive: true,
        user: { id: userId },
      });
    } else {
      existing.user = { id: userId } as any;
      existing.platform = platform;
      existing.isActive = true;
    }

    return this.repo.save(existing);
  }

  async getActiveTokensForUser(userId: string): Promise<string[]> {
    const rows = await this.repo.find({ where: { user: { id: userId }, isActive: true } });
    return rows.map((r) => r.token);
  }
}
