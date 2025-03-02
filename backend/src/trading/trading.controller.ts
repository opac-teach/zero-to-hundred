import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { TradingService } from './trading.service';
import { BuyMemecoinDto, SellMemecoinDto, TradeResponseDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('trading')
@Controller('trading')
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @ApiOperation({ summary: 'Buy memecoin' })
  @ApiResponse({ status: 201, description: 'Memecoin successfully purchased', type: TradeResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input or insufficient balance' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Memecoin or user not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('buy')
  async buyMemecoin(
    @Request() req,
    @Body() buyMemecoinDto: BuyMemecoinDto,
  ): Promise<TradeResponseDto> {
    return this.tradingService.buyMemecoin(req.user.id, buyMemecoinDto);
  }

  @ApiOperation({ summary: 'Sell memecoin' })
  @ApiResponse({ status: 201, description: 'Memecoin successfully sold', type: TradeResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input or insufficient memecoin balance' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Memecoin or user not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('sell')
  async sellMemecoin(
    @Request() req,
    @Body() sellMemecoinDto: SellMemecoinDto,
  ): Promise<TradeResponseDto> {
    return this.tradingService.sellMemecoin(req.user.id, sellMemecoinDto);
  }
}
