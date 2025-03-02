import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MemecoinPriceDto {
  @ApiProperty({ description: 'The current price of the memecoin in ZTH' })
  @Expose()
  price: number;

  @ApiProperty({ description: 'The total supply of the memecoin' })
  @Expose()
  supply: number;

  @ApiProperty({ description: 'The market sentiment based on recent trading activity', enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'] })
  @Expose()
  marketSentiment: string;

  constructor(partial: Partial<MemecoinPriceDto>) {
    Object.assign(this, partial);
  }
} 