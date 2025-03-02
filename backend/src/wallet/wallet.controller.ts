import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletResponseDto, TransactionResponseDto } from './dto';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiOperation({ summary: 'Get current user\'s wallet' })
  @ApiResponse({ status: 200, description: 'Return the user\'s wallet', type: WalletResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getWallet(@Request() req): Promise<WalletResponseDto> {
    return this.walletService.getWalletByUserId(req.user.id);
  }

  @ApiOperation({ summary: 'Get current user\'s transaction history' })
  @ApiResponse({ status: 200, description: 'Return the user\'s transaction history', type: [TransactionResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async getTransactions(@Request() req): Promise<TransactionResponseDto[]> {
    return this.walletService.getTransactionsByUserId(req.user.id);
  }
}
