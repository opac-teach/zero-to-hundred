import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MemecoinVolumeDto {
  @ApiProperty({ description: 'The ID of the memecoin' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'The ticker symbol of the memecoin' })
  @Expose()
  ticker: string;

  @ApiProperty({ description: 'The trading volume for this memecoin in ZTH' })
  @Expose()
  volume: number;
}

@Exclude()
export class TradingVolumeDto {
  @ApiProperty({ description: 'The total trading volume in ZTH' })
  @Expose()
  totalVolume: number;

  @ApiProperty({ description: 'The buy volume in ZTH' })
  @Expose()
  buyVolume: number;

  @ApiProperty({ description: 'The sell volume in ZTH' })
  @Expose()
  sellVolume: number;

  @ApiProperty({ description: 'The timeframe for the statistics', enum: ['24h', '7d', '30d'] })
  @Expose()
  timeframe: string;

  @ApiProperty({ type: [MemecoinVolumeDto], description: 'Volume statistics per memecoin' })
  @Expose()
  memecoins: MemecoinVolumeDto[];

  constructor(partial: Partial<TradingVolumeDto>) {
    Object.assign(this, partial);
  }
} 