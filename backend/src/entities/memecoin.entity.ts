import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('memecoins')
export class Memecoin {
  @ApiProperty({ description: 'The unique identifier of the memecoin' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The name of the memecoin' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'The symbol of the memecoin' })
  @Column({ unique: true })
  symbol: string;

  @ApiProperty({ description: 'The description of the memecoin' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'The logo URL of the memecoin' })
  @Column({ nullable: true })
  logoUrl: string;

  @ApiProperty({ description: 'The total supply of the memecoin' })
  @Column({ type: 'decimal', precision: 24, scale: 8, default: 0 })
  totalSupply: number;

  @ApiProperty({ description: 'The current price of the memecoin in USD' })
  @Column({ type: 'decimal', precision: 24, scale: 8, default: 0 })
  currentPrice: number;

  @ApiProperty({ description: 'The market cap of the memecoin in USD' })
  @Column({ type: 'decimal', precision: 24, scale: 8, default: 0 })
  marketCap: number;

  @ApiProperty({ description: 'The 24h trading volume of the memecoin in USD' })
  @Column({ type: 'decimal', precision: 24, scale: 8, default: 0 })
  volume24h: number;

  @ApiProperty({ description: 'The creator of the memecoin' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  creatorId: string;

  @ApiProperty({ description: 'Whether the memecoin is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'The date when the memecoin was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'The date when the memecoin was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
} 