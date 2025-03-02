import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradingService } from './trading.service';
import { TradingController } from './trading.controller';
import { Memecoin } from '../entities/memecoin.entity';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { WalletHolding } from '../entities/wallet-holding.entity';
import { Transaction } from '../entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Memecoin,
      User,
      Wallet,
      WalletHolding,
      Transaction
    ])
  ],
  providers: [TradingService],
  controllers: [TradingController]
})
export class TradingModule {}
