import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from '../entities/wallet.entity';
import { WalletHolding } from '../entities/wallet-holding.entity';
import { Transaction } from '../entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, WalletHolding, Transaction])],
  providers: [WalletService],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {} 