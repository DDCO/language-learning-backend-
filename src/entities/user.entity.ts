import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { Conversation } from './conversation.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'text', nullable: true })
  password!: string | null; // Should be hashed if local auth is used

  @Column({ type: 'text', unique: true, nullable: true })
  googleId!: string | null;

  @Column({ type: 'text', nullable: true })
  refreshTokenHash!: string | null;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => UserProfile, (profile) => profile.user)
  profiles!: UserProfile[];

  @OneToMany(() => Conversation, (conversation) => conversation.user)
  conversations!: Conversation[];
}
