import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../entities/user-profile.entity';
import { Content } from '../entities/content.entity';
import { ScraperService } from '../services/scraper.service';
import { DeviceTokenService } from '../services/device-token.service';
import { PushService } from '../services/push.service';
import { LLMService } from '../llm/llm.service';

@Injectable()
export class ContentRefreshJob {
  private readonly logger = new Logger(ContentRefreshJob.name);

  constructor(
    @InjectRepository(UserProfile)
    private readonly profileRepo: Repository<UserProfile>,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    private readonly scraperService: ScraperService,
    private readonly deviceTokenService: DeviceTokenService,
    private readonly pushService: PushService,
    private readonly llmService: LLMService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async refreshContentFromProfiles(): Promise<void> {
    if (process.env.ENABLE_CONTENT_REFRESH !== 'true') {
      return;
    }

    const profiles = await this.profileRepo.find({
      where: { isActive: true },
      relations: { user: true },
      take: 100,
      order: { updatedAt: 'DESC' },
    });

    for (const profile of profiles) {
      for (const interest of profile.interests || []) {
        if (!interest.startsWith('reddit:r/')) {
          continue;
        }

        const items = await this.scraperService.scrapeByInterest(interest);
        for (const item of items) {
          const existing = await this.contentRepo.findOne({ where: { url: item.url } });
          if (existing) {
            continue;
          }

          const content = this.contentRepo.create({
            url: item.url,
            title: item.title,
            summary: item.summary,
            interest,
            source: item.source,
            publishedAt: item.publishedAt,
            tags: [interest],
            processed: false,
          });
          await this.contentRepo.save(content);
        }
      }

      const now = new Date();
      const last = profile.lastNotifiedAt ? new Date(profile.lastNotifiedAt) : null;
      const elapsedMs = last ? now.getTime() - last.getTime() : Number.MAX_SAFE_INTEGER;
      const frequencyMs = (profile.checkFrequencyHours || 24) * 60 * 60 * 1000;
      if (elapsedMs < frequencyMs) {
        continue;
      }

      const latest = await this.contentRepo.findOne({
        where: { interest: (profile.interests || [])[0] },
        order: { discoveredAt: 'DESC' },
      });

      if (!latest) {
        continue;
      }

      const tokens = await this.deviceTokenService.getActiveTokensForUser(profile.user.id);
      if (!tokens.length) {
        continue;
      }

      const llmText = await this.llmService.generateTopicOpener(
        latest.title,
        profile.interests || [],
        profile.targetLanguage,
      );

      await this.pushService.send(
        tokens,
        'New topic for you',
        llmText,
        { contentUrl: latest.url, interest: latest.interest },
      );

      profile.lastNotifiedAt = now;
      await this.profileRepo.save(profile);
    }

    this.logger.log('Periodic content refresh completed');
  }
}
