import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @ApiProperty({ description: 'The unique identifier of the user' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'The username of the user' })
  @Expose()
  username: string;

  @ApiProperty({ description: 'The email of the user' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'The full name of the user' })
  @Expose()
  fullName: string;

  @ApiProperty({ description: 'The role of the user' })
  @Expose()
  role: string;

  @ApiProperty({ description: 'The profile picture URL of the user' })
  @Expose()
  profilePictureUrl: string;

  @ApiProperty({ description: 'The banner URL of the user' })
  @Expose()
  bannerUrl: string;

  @ApiProperty({ description: 'The description of the user' })
  @Expose()
  description: string;

  @ApiProperty({ description: 'The background color of the user profile' })
  @Expose()
  backgroundColor: string;

  @ApiProperty({ description: 'The text color of the user profile' })
  @Expose()
  textColor: string;

  @ApiProperty({ description: 'The date when the user was created' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'The date when the user was last updated' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: 'The user\'s ZTH balance' })
  @Expose()
  zthBalance: number;

  @ApiProperty({ description: 'The user\'s rank in the leaderboard' })
  @Expose()
  rank?: number;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
} 