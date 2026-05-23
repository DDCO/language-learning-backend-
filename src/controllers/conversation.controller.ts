import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationService } from '../services/conversation.service';
import { UserProfile } from '../entities/user-profile.entity';
import { AddMessageDto, ConversationListQueryDto, StartConversationDto } from '../dto/conversation.dto';

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
    @Body() body: StartConversationDto,
  ) {
    const profile = await this.profileRepo.findOne({
      where: { id: body.profileId, user: { id: req.user.userId }, isActive: true },
      relations: { user: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
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
    @Req() req: AuthenticatedRequest,
    @Param('id') conversationId: string,
    @Body() body: AddMessageDto,
  ) {
    return this.conversationService.addMessage(
      req.user.userId,
      conversationId,
      body.message,
      body.targetLanguage,
    );
  }

  @Get()
  getMyConversations(@Req() req: AuthenticatedRequest, @Query() query: ConversationListQueryDto) {
    return this.conversationService.getUserConversations(
      req.user.userId,
      query.page,
      query.limit,
      query.status,
    );
  }

  @Get(':id')
  getConversation(@Req() req: AuthenticatedRequest, @Param('id') conversationId: string) {
    return this.conversationService.getConversation(req.user.userId, conversationId);
  }

  @Patch(':id/complete')
  completeConversation(@Req() req: AuthenticatedRequest, @Param('id') conversationId: string) {
    return this.conversationService.completeConversation(req.user.userId, conversationId);
  }
}
