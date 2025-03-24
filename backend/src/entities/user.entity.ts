import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Exclude, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Wallet } from './wallet.entity';

@Entity('users')
export class User {
  @ApiProperty({ description: 'The unique identifier of the user' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The username of the user' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ description: 'The email of the user' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'The full name of the user' })
  @Column({ nullable: true })
  userTitle: string;

  @Exclude()
  @Column()
  password: string;

  @ApiProperty({ description: 'The profile picture URL of the user' })
  @Column({ nullable: true })
  profilePictureUrl: string;

  @ApiProperty({ description: 'The banner URL of the user' })
  @Column({ nullable: true })
  bannerUrl: string;

  @ApiProperty({ description: 'The description of the user' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'The background color of the user profile' })
  @Column({ default: '#f5f5f5' })
  backgroundColor: string;

  @ApiProperty({ description: 'The text color of the user profile' })
  @Column({ default: '#333333' })
  textColor: string;

  @ApiProperty({ description: 'Whether the user is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: "The user's wallet" })
  @OneToOne(() => Wallet, (wallet) => wallet.owner)
  @Exclude({ toPlainOnly: true })
  wallet: Wallet;

  @ApiProperty({ description: 'The date when the user was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'The date when the user was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}
