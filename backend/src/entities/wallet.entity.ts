import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('wallets')
export class Wallet {
  @ApiProperty({ description: 'The unique identifier of the wallet' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The address of the wallet' })
  @Column({ unique: true })
  address: string;

  @ApiProperty({ description: 'The balance of the wallet in USD' })
  @Column({ type: 'decimal', precision: 24, scale: 8, default: 0 })
  balance: number;

  @ApiProperty({ description: 'The owner of the wallet' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;

  @ApiProperty({ description: 'Whether the wallet is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'The date when the wallet was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'The date when the wallet was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
} 