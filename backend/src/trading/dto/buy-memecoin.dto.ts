import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsPositive,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { BigNumber } from 'bignumber.js';

export class BuyMemecoinDto {
  @ApiProperty({
    description: 'The ID of the memecoin to buy',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  memecoinId: string;

  @ApiProperty({
    description: 'The amount of ZTH to spend',
    example: '10',
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
