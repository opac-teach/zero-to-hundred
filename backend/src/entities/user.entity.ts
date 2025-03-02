import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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
  fullName: string;

  @Exclude()
  @Column()
  password: string;

  @ApiProperty({ description: 'The role of the user' })
  @Column({ default: 'user' })
  role: string;

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

  @ApiProperty({ description: 'The date when the user was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'The date when the user was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'The ZTH balance of the user' })
  @Column({ type: 'decimal', precision: 18, scale: 8, default: 100 })
  zthBalance: number;
} 