import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

export class TopicSourceSelectionDto {
  @IsString()
  source!: string;

  @IsArray()
  @IsString({ each: true })
  items!: string[];
}

export class CreateProfileDto {
  @IsString()
  targetLanguage!: string;

  @IsArray()
  @IsString({ each: true })
  interests!: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicSourceSelectionDto)
  topicSources?: TopicSourceSelectionDto[];

  @IsOptional()
  @IsArray()
  interestWeights?: number[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(168)
  checkFrequencyHours?: number;
}

export class UpdateInterestsDto {
  @IsArray()
  @IsString({ each: true })
  interests!: string[];

  @IsOptional()
  @IsArray()
  weights?: number[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicSourceSelectionDto)
  topicSources?: TopicSourceSelectionDto[];
}

export class UpdateCheckFrequencyDto {
  @IsInt()
  @Min(1)
  @Max(168)
  hours!: number;
}
