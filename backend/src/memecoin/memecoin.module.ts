import { Module } from '@nestjs/common';
import { MemecoinService } from './memecoin.service';
import { MemecoinController } from './memecoin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Memecoin } from '../entities/memecoin.entity';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { Transaction } from '../entities/transaction.entity';
import { StatisticsModule } from '../statistics/statistics.module';
import { WalletHolding } from 'src/entities/wallet-holding.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Memecoin,
      User,
      Wallet,
      WalletHolding,
      Transaction,
    ]),
    StatisticsModule,
  ],
  providers: [MemecoinService],
  controllers: [MemecoinController],
  exports: [MemecoinService],
})
export class MemecoinModule {}
