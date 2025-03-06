import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { TradingService } from './trading.service';
import { TradeMemecoinDto, TradeResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TradeEstimationResponseDto } from './dto/estimate-trade-response.dto';

@ApiTags('trading')
@Controller('trading')
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @ApiOperation({ summary: 'Trade memecoin' })
  @ApiResponse({
    status: 201,
    description: 'Memecoin successfully traded',
    type: TradeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or insufficient balance',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Memecoin or user not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('trade')
  async tradeMemecoin(
    @Request() req,
    @Body() tradeMemecoinDto: TradeMemecoinDto,
  ): Promise<TradeResponseDto> {
    return this.tradingService.tradeMemecoin(req.user.id, tradeMemecoinDto);
  }
  @ApiOperation({ summary: 'Get trade cost estimation' })
  @ApiResponse({
    status: 201,
    description: 'Trade cost estimation',
    type: TradeEstimationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or insufficient balance',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Memecoin or user not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('estimate')
  async estimateTradeMemecoin(
    @Request() req,
    @Body() tradeMemecoinDto: TradeMemecoinDto,
  ): Promise<TradeEstimationResponseDto> {
    return this.tradingService.estimateTradeMemecoin(
      req.user.id,
      tradeMemecoinDto,
    );
  }
}
