import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService, CreateProfileDTO } from '../services/profile.service';
import { CreateProfileDto, UpdateCheckFrequencyDto, UpdateInterestsDto } from '../dto/profile.dto';

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
    @Body() body: CreateProfileDto,
  ) {
    return this.profileService.createProfile(req.user.userId, body as CreateProfileDTO);
  }

  @Get()
  getMyProfiles(@Req() req: AuthenticatedRequest) {
    return this.profileService.getUserProfiles(req.user.userId);
  }

  @Patch(':id/interests')
  updateInterests(
    @Req() req: AuthenticatedRequest,
    @Param('id') profileId: string,
    @Body() body: UpdateInterestsDto,
  ) {
    return this.profileService.updateInterests(
      req.user.userId,
      profileId,
      body.interests,
      body.weights,
      body.topicSources,
    );
  }

  @Patch(':id/check-frequency')
  updateCheckFrequency(
    @Req() req: AuthenticatedRequest,
    @Param('id') profileId: string,
    @Body() body: UpdateCheckFrequencyDto,
  ) {
    return this.profileService.updateCheckFrequency(req.user.userId, profileId, body.hours);
  }

  @Delete(':id')
  deactivateProfile(@Req() req: AuthenticatedRequest, @Param('id') profileId: string) {
    return this.profileService.deactivateProfile(req.user.userId, profileId);
  }
}
