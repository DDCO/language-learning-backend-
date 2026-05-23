import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class StartConversationDto {
  @IsString()
  profileId!: string;

  @IsString()
  topic!: string;

  @IsOptional()
  @IsString()
  contentSource?: string;
}

export class AddMessageDto {
  @IsString()
  message!: string;

  @IsString()
  targetLanguage!: string;
}

export class ConversationListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsIn(['active', 'completed', 'archived'])
  status?: 'active' | 'completed' | 'archived';
}
