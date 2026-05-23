import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../entities/user-profile.entity';
import { Content } from '../entities/content.entity';
import { ScraperService } from '../services/scraper.service';

@Injectable()
export class ContentRefreshJob {
  private readonly logger = new Logger(ContentRefreshJob.name);

  constructor(
    @InjectRepository(UserProfile)
    private readonly profileRepo: Repository<UserProfile>,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    private readonly scraperService: ScraperService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async refreshContentFromProfiles(): Promise<void> {
    if (process.env.ENABLE_CONTENT_REFRESH !== 'true') {
      return;
    }

    const profiles = await this.profileRepo.find({
      where: { isActive: true },
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
    }

    this.logger.log('Periodic content refresh completed');
  }
}
