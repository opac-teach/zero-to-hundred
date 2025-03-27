import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsHexColor } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'johndoe',
    required: false,
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  userTitle?: string;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  cacabouind: string;

  @ApiProperty({
    description: 'The profile picture URL of the user',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  profilePictureUrl?: string;

  @ApiProperty({
    description: 'The banner URL of the user',
    example: 'https://example.com/banner.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @ApiProperty({
    description: 'The description of the user',
    example: 'I am a memecoin enthusiast',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The background color of the user profile',
    example: '#f5f5f5',
    required: false,
  })
  @IsHexColor()
  @IsOptional()
  backgroundColor?: string;

  @ApiProperty({
    description: 'The text color of the user profile',
    example: '#333333',
    required: false,
  })
  @IsHexColor()
  @IsOptional()
  textColor?: string;
}
