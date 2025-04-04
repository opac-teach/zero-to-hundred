import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  Matches,
  IsUrl,
  IsDecimal,
  IsEnum,
  ValidateNested,
  ValidateIf,
  Validate,
} from 'class-validator';
import { BondingCurveConfig } from '../../trading/bonding-curve';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'customText', async: false })
export class PositiveStringNumber implements ValidatorConstraintInterface {
  validate(text: string) {
    return Number(text) > 0;
  }

  defaultMessage() {
    return '$property should be a positive number string (got $value)';
  }
}

export class BondingCurveConfigDto implements BondingCurveConfig {
  @ApiProperty({
    description: 'Slope of the bonding curve',
    example: '1.5',
  })
  @IsString()
  @IsDecimal()
  @IsNotEmpty()
  @Validate(PositiveStringNumber)
  slope: string;

  @ApiProperty({
    description: 'Starting price of the bonding curve',
    example: '10',
  })
  @IsString()
  @IsDecimal()
  @IsNotEmpty()
  @Validate(PositiveStringNumber)
  startingPrice: string;

  @ApiProperty({
    description: 'Type of the bonding curve',
    example: 'linear',
    enum: ['linear', 'exponential'],
  })
  @IsString()
  @IsEnum(['linear', 'exponential'])
  @IsNotEmpty()
  curveType: 'linear' | 'exponential';

  constructor(partial: Partial<BondingCurveConfigDto>) {
    Object.assign(this, partial);
  }
}

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
  @ValidateIf((o) => o.logoUrl && o.logoUrl !== '')
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({
    description: 'The bonding curve configuration',
    required: false,
  })
  @Type(() => BondingCurveConfigDto)
  @ValidateNested()
  @IsOptional()
  curveConfig?: BondingCurveConfigDto;
}
