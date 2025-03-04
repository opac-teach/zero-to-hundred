import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateMemecoinDto {
  @ApiProperty({
    description: 'The name of the memecoin',
    example: 'Doge Coin',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'The symbol of the memecoin',
    example: 'DOGE',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Symbol must contain only uppercase letters and numbers',
  })
  symbol: string;

  @ApiProperty({
    description: 'The description of the memecoin',
    example:
      'A fun cryptocurrency featuring the Shiba Inu dog from the "Doge" meme.',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'The logo URL of the memecoin',
    example: 'https://example.com/doge-logo.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  logoUrl?: string;
}
