import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Conversation } from './entities/conversation.entity';
import { Content } from './entities/content.entity';
import { DeviceToken } from './entities/device-token.entity';
import { LLMService } from './llm/llm.service';
import { AuthModule } from './auth/auth.module';
import { TopicSourceService } from './topic-sources/topic-source.service';
import { RedditTopicSourceService } from './topic-sources/reddit-topic-source.service';
import { ProfileService } from './services/profile.service';
import { ConversationService } from './services/conversation.service';
import { ProfileController } from './controllers/profile.controller';
import { ConversationController } from './controllers/conversation.controller';
import { ScraperService } from './services/scraper.service';
import { ContentRefreshJob } from './jobs/content-refresh.job';
import { NotificationsController } from './controllers/notifications.controller';
import { DeviceTokenService } from './services/device-token.service';
import { PushService } from './services/push.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'language_learning',
      entities: [User, UserProfile, Conversation, Content, DeviceToken],
      synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
      logging: process.env.NODE_ENV === 'development',
      migrations: ['dist/migrations/*.js'],
      migrationsRun: process.env.TYPEORM_RUN_MIGRATIONS === 'true',
    }),
    TypeOrmModule.forFeature([User, UserProfile, Conversation, Content, DeviceToken]),
    AuthModule,
  ],
  controllers: [ProfileController, ConversationController, NotificationsController],
  providers: [
    LLMService,
    TopicSourceService,
    RedditTopicSourceService,
    ProfileService,
    ConversationService,
    ScraperService,
    DeviceTokenService,
    PushService,
    ContentRefreshJob,
  ],
  exports: [LLMService, TopicSourceService],
})
export class AppModule {}
