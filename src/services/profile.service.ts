import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../entities/user-profile.entity';

export interface CreateProfileDTO {
  targetLanguage: string;
  interests: string[];
  interestWeights?: number[];
  checkFrequencyHours?: number;
}

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private profileRepo: Repository<UserProfile>,
  ) {}

  /**
   * Create a new user profile
   */
  async createProfile(
    userId: string,
    dto: CreateProfileDTO,
  ): Promise<UserProfile> {
    const { interests, interestWeights } = dto;
    
    // If no weights provided, distribute equally
    const weights = interestWeights || interests.map(() => 1 / interests.length);

    const profile = this.profileRepo.create({
      user: { id: userId },
      targetLanguage: dto.targetLanguage,
      interests,
      interestWeights: weights,
      checkFrequencyHours: dto.checkFrequencyHours || 24,
    });

    return this.profileRepo.save(profile);
  }

  /**
   * Get profiles for a user
   */
  async getUserProfiles(userId: string): Promise<UserProfile[]> {
    return this.profileRepo.find({
      where: { user: { id: userId }, isActive: true },
    });
  }

  /**
   * Update profile interests
   */
  async updateInterests(
    profileId: string,
    interests: string[],
    weights?: number[],
  ): Promise<UserProfile> {
    const profile = await this.profileRepo.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    profile.interests = interests;
    profile.interestWeights = weights || interests.map(() => 1 / interests.length);
    profile.updatedAt = new Date();

    return this.profileRepo.save(profile);
  }

  /**
   * Update check frequency
   */
  async updateCheckFrequency(
    profileId: string,
    hours: number,
  ): Promise<UserProfile> {
    const profile = await this.profileRepo.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    profile.checkFrequencyHours = Math.max(1, hours);
    profile.updatedAt = new Date();

    return this.profileRepo.save(profile);
  }

  /**
   * Deactivate profile
   */
  async deactivateProfile(profileId: string): Promise<UserProfile> {
    const profile = await this.profileRepo.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    profile.isActive = false;
    profile.updatedAt = new Date();

    return this.profileRepo.save(profile);
  }
}
