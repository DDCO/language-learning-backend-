import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService, CreateProfileDTO } from '../services/profile.service';
import { TopicSourceSelection } from '../topic-sources/topic-source.interface';

type AuthenticatedRequest = {
  user: {
    userId: string;
    email: string;
  };
};

@Controller('profiles')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  createProfile(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateProfileDTO,
  ) {
    return this.profileService.createProfile(req.user.userId, body);
  }

  @Get()
  getMyProfiles(@Req() req: AuthenticatedRequest) {
    return this.profileService.getUserProfiles(req.user.userId);
  }

  @Patch(':id/interests')
  updateInterests(
    @Param('id') profileId: string,
    @Body() body: { interests: string[]; weights?: number[]; topicSources?: TopicSourceSelection[] },
  ) {
    return this.profileService.updateInterests(
      profileId,
      body.interests,
      body.weights,
      body.topicSources,
    );
  }

  @Patch(':id/check-frequency')
  updateCheckFrequency(
    @Param('id') profileId: string,
    @Body() body: { hours: number },
  ) {
    return this.profileService.updateCheckFrequency(profileId, body.hours);
  }

  @Delete(':id')
  deactivateProfile(@Param('id') profileId: string) {
    return this.profileService.deactivateProfile(profileId);
  }
}
