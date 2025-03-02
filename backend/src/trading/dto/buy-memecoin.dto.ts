import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

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
    example: 10,
  })
  @IsNumber()
  @Min(0.000001)
  amount: number;

  @ApiProperty({
    description: 'The maximum slippage tolerance in percentage',
    example: 2.5,
    default: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  slippageTolerance?: number;
} 