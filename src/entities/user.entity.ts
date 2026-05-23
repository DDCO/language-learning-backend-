import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { Conversation } from './conversation.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Should be hashed

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserProfile, (profile) => profile.user)
  profiles: UserProfile[];

  @OneToMany(() => Conversation, (conversation) => conversation.user)
  conversations: Conversation[];
}
