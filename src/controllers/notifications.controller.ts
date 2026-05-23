import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDeviceTokenDto } from '../dto/device-token.dto';
import { DeviceTokenService } from '../services/device-token.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly deviceTokenService: DeviceTokenService) {}

  @Post('register-device')
  async registerDevice(
    @Req() req: { user: { userId: string } },
    @Body() body: RegisterDeviceTokenDto,
  ) {
    await this.deviceTokenService.register(req.user.userId, body.token, body.platform);
    return { registered: true };
  }
}
