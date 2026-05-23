import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Conversation } from './conversation.entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  targetLanguage: string; // e.g., 'Portuguese'

  @Column('simple-array')
  interests: string[]; // e.g., ['sports', 'politics', 'technology']

  @Column('simple-array')
  interestWeights: number[]; // Weights for each interest (0-1)

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 24 })
  checkFrequencyHours: number; // How often to check for new content

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.profiles, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Conversation, (conversation) => conversation.profile)
  conversations: Conversation[];
}
