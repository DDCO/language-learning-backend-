import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Conversation } from './entities/conversation.entity';
import { Content } from './entities/content.entity';
import { LLMService } from './llm/llm.service';
import { AuthModule } from './auth/auth.module';
import { TopicSourceService } from './topic-sources/topic-source.service';
import { RedditTopicSourceService } from './topic-sources/reddit-topic-source.service';
import { ProfileService } from './services/profile.service';
import { ConversationService } from './services/conversation.service';
import { ProfileController } from './controllers/profile.controller';
import { ConversationController } from './controllers/conversation.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'language_learning',
      entities: [User, UserProfile, Conversation, Content],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([User, UserProfile, Conversation, Content]),
    AuthModule,
  ],
  controllers: [ProfileController, ConversationController],
  providers: [
    LLMService,
    TopicSourceService,
    RedditTopicSourceService,
    ProfileService,
    ConversationService,
  ],
  exports: [LLMService, TopicSourceService],
})
export class AppModule {}
