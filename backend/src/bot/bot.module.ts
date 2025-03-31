import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Wallet } from 'src/entities/wallet.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { TradingService } from 'src/trading/trading.service';
import { Memecoin } from 'src/entities/memecoin.entity';
import { WalletHolding } from 'src/entities/wallet-holding.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Wallet,
      Transaction,
      Memecoin,
      WalletHolding,
    ]),
  ],
  providers: [BotService, TradingService],
})
export class BotModule {}
