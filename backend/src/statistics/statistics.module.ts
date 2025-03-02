import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Transaction } from '../entities/transaction.entity';
import { Memecoin } from '../entities/memecoin.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      Memecoin,
      User
    ])
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService]
})
export class StatisticsModule {} 