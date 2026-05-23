import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { UserProfile } from './user-profile.entity';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  topic: string; // The topic that triggered this conversation

  @Column({ nullable: true })
  contentSource: string; // URL or source of the news/content

  @Column('jsonb')
  messages: Message[]; // Array of messages in the conversation

  @Column({ default: 0 })
  messageCount: number;

  @Column({ default: 'active' })
  status: 'active' | 'completed' | 'archived';

  @CreateDateColumn()
  startedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.conversations, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => UserProfile, (profile) => profile.conversations, { onDelete: 'CASCADE' })
  profile: UserProfile;
}
