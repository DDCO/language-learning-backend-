import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('content')
@Index(['url'], { unique: true })
@Index(['interest', 'discoveredAt'])
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  url!: string; // Unique URL of the content

  @Column()
  title!: string;

  @Column('text')
  summary!: string; // Brief summary of content

  @Column()
  interest!: string; // Which interest category this belongs to

  @Column('simple-array', { nullable: true })
  tags!: string[];

  @Column({ nullable: true })
  source!: string; // e.g., 'sports.com', 'bbc.com'

  @Column({ type: 'timestamp', nullable: true })
  publishedAt!: Date;

  @CreateDateColumn()
  discoveredAt!: Date;

  @Column({ type: 'boolean', default: false })
  processed!: boolean; // Whether conversations have been generated from this
}
