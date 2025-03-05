import { ApiProperty } from '@nestjs/swagger';

export class GlobalMemecoinVolumeDto {
  @ApiProperty({ description: 'The unique identifier of the memecoin' })
  id: string;

  @ApiProperty({ description: 'The symbol of the memecoin' })
  ticker: string;

  @ApiProperty({ description: 'The trading volume of the memecoin in ZTH' })
  volume: number;
}

export class GlobalStatisticsDto {
  @ApiProperty({ description: 'The total trading volume in ZTH' })
  totalVolume: number;

  @ApiProperty({ description: 'The total buy volume in ZTH' })
  buyVolume: number;

  @ApiProperty({ description: 'The total sell volume in ZTH' })
  sellVolume: number;

  @ApiProperty({
    description: 'The trading volumes for each memecoin',
    type: [GlobalMemecoinVolumeDto],
  })
  memecoinVolumes: GlobalMemecoinVolumeDto[];
} 