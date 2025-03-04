import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { Transform } from 'class-transformer';
import BigNumber from 'bignumber.js';

export class SellMemecoinDto {
  @ApiProperty({
    description: 'The ID of the memecoin to sell',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  memecoinId: string;

  @ApiProperty({
    description: 'The amount of memecoin tokens to sell',
    example: '5',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => new BigNumber(value).toString())
  amount: string;

  @ApiProperty({
    description: 'The price of the memecoin at the time of the request',
    example: '0.1',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => new BigNumber(value).toString())
  requestPrice: string;

  @ApiProperty({
    description: 'The maximum slippage tolerance in percentage',
    example: '2.5',
    default: '1',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  slippageTolerance?: number;
}
