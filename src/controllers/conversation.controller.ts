import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationService } from '../services/conversation.service';
import { UserProfile } from '../entities/user-profile.entity';

type AuthenticatedRequest = {
  user: {
    userId: string;
    email: string;
  };
};

@Controller('conversations')
@UseGuards(AuthGuard('jwt'))
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    @InjectRepository(UserProfile)
    private readonly profileRepo: Repository<UserProfile>,
  ) {}

  @Post('start')
  async startConversation(
    @Req() req: AuthenticatedRequest,
    @Body() body: { profileId: string; topic: string; contentSource?: string },
  ) {
    const profile = await this.profileRepo.findOne({
      where: { id: body.profileId, user: { id: req.user.userId }, isActive: true },
      relations: { user: true },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    return this.conversationService.startConversation(
      req.user.userId,
      profile,
      body.topic,
      body.contentSource,
    );
  }

  @Post(':id/messages')
  addMessage(
    @Param('id') conversationId: string,
    @Body() body: { message: string; targetLanguage: string },
  ) {
    return this.conversationService.addMessage(
      conversationId,
      body.message,
      body.targetLanguage,
    );
  }

  @Get()
  getMyConversations(@Req() req: AuthenticatedRequest) {
    return this.conversationService.getUserConversations(req.user.userId);
  }

  @Get(':id')
  getConversation(@Param('id') conversationId: string) {
    return this.conversationService.getConversation(conversationId);
  }

  @Patch(':id/complete')
  completeConversation(@Param('id') conversationId: string) {
    return this.conversationService.completeConversation(conversationId);
  }
}
