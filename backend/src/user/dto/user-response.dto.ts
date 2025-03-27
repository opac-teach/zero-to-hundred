import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

@Exclude()
export class PublicUserResponseDto {
  @ApiProperty({ description: 'The unique identifier of the user' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'The username of the user' })
  @Expose()
  username: string;

  @ApiProperty({ description: 'The full name of the user' })
  @Expose()
  userTitle: string;

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

  @ApiProperty({ description: 'Whether the user is active' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: 'The date when the user was created' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'The date when the user was last updated' })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<PublicUserResponseDto>) {
    Object.assign(this, partial);
  }
}

@Exclude()
export class PrivateUserResponseDto extends PublicUserResponseDto {
  @Expose()
  email: string;

  constructor(partial: Partial<PrivateUserResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
