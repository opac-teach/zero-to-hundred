import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import Decimal from 'decimal.js';
import { TradingService } from '../trading/trading.service';
import { calculateSellPrice } from '../trading/bonding-curve';
import { TradeMemecoinDto } from '../trading/dto/trade-memecoin.dto';
import { Wallet } from '../entities/wallet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionType } from '../entities/transaction.entity';
import { Transaction } from '../entities/transaction.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { TradeResponseDto } from '../trading/dto/trade-response.dto';

@Injectable()
export class BotService {
  constructor(
    private readonly tradingService: TradingService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  //   @Cron('*/4 * * * * *')
  //   handleCron() {
  //     this.checkAllUsers().catch(console.error);
  //   }

  @OnEvent('trade')
  async handleTrade(transactionResponse: TradeResponseDto) {
    if (transactionResponse.transaction.type === TransactionType.BUY) {
      const users = await this.userRepository.find({
        where: { bot: true },
      });
      for (const user of users) {
        await this.checkBot(user);
      }
    }
  }

  async checkBot(user: User) {
    const wallet = await this.walletRepository.findOne({
      where: {
        ownerId: user.id,
      },
      relations: ['holdings', 'holdings', 'holdings.memecoin'],
    });

    const holdings = wallet.holdings.filter((h) => new Decimal(h.amount).gt(0));

    for (const holding of holdings) {
      let transactions = await this.transactionRepository.find({
        where: {
          memecoinId: holding.memecoin.id,
          userId: user.id,
        },
        order: {
          createdAt: 'DESC',
        },
      });
      transactions.filter((t) => t.type !== 'CREATE');

      let bal = new Decimal(0);
      let actualTxs = [];

      for (const transaction of transactions) {
        if (transaction.type === TransactionType.BUY) {
          bal = bal.plus(transaction.memeCoinAmount);
        } else if (transaction.type === TransactionType.SELL) {
          bal = bal.minus(transaction.memeCoinAmount);
        }
        actualTxs.push(transaction);
        if (bal.eq(holding.amount)) {
          break;
        }
      }
      let totalCost = new Decimal(0);
      for (const transaction of actualTxs) {
        totalCost = totalCost.plus(transaction.zthAmount);
      }

      const tradeParams: TradeMemecoinDto = {
        memecoinId: holding.memecoin.id,
        amount: holding.amount,
        tradeType: 'sell',
        requestCost: calculateSellPrice(
          holding.amount,
          holding.memecoin.totalSupply,
          holding.memecoin.curveConfig,
        ),
        slippageTolerance: 0.01,
      };
      const estimatedTrade =
        await this.tradingService.estimateTradeMemecoin(tradeParams);

      const profit = new Decimal(estimatedTrade.cost).minus(totalCost);
      if (profit.gt(0)) {
        console.log('profit detected !', profit.toString());

        await this.tradingService.tradeMemecoin(user.id, tradeParams);
      }
    }
  }
}
