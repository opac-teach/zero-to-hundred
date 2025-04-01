import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { MemecoinResponseDto } from '../../memecoin/dto';
import { IsNotEmpty } from 'class-validator';
import { IsString } from 'class-validator';

@Exclude()
export class TradeEstimationResponseDto {
  @ApiProperty({ description: 'The memecoin details' })
  @Expose()
  @Type(() => MemecoinResponseDto)
  memecoin: MemecoinResponseDto;

  @ApiProperty({
    description: 'The type of trade to perform',
    example: 'buy',
  })
  @IsString()
  @IsNotEmpty()
  tradeType: 'buy' | 'sell';

  @ApiProperty({ description: 'The cost of the trade' })
  @Expose()
  zthAmount: string;

  @ApiProperty({ description: 'The amount of memecoin tokens to sell' })
  @Expose()
  memecoinAmount: string;

  constructor(partial: Partial<TradeEstimationResponseDto>) {
    Object.assign(this, partial);
  }
}
