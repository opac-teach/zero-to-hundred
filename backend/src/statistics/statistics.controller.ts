import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { TradingVolumeDto } from './dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @ApiOperation({ summary: 'Get trading volume statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return trading volume statistics',
    type: TradingVolumeDto,
  })
  @ApiQuery({
    name: 'timeframe',
    required: false,
    enum: ['24h', '7d', '30d'],
    description: 'Timeframe for statistics',
  })
  @ApiQuery({
    name: 'memecoinId',
    required: false,
    description: 'Filter by memecoin ID',
  })
  @Get('trading-volume')
  async getTradingVolume(
    @Query('timeframe') timeframe: string = '24h',
    @Query('memecoinId') memecoinId?: string,
  ): Promise<TradingVolumeDto> {
    return this.statisticsService.getTradingVolume(timeframe, memecoinId);
  }
}
