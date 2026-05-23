import { IsIn, IsString } from 'class-validator';

export class RegisterDeviceTokenDto {
  @IsString()
  token!: string;

  @IsString()
  @IsIn(['android', 'ios'])
  platform!: 'android' | 'ios';
}
