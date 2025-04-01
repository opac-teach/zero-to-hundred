import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Memecoin } from 'src/entities/memecoin.entity';
import { Repository } from 'typeorm';
import Decimal from 'decimal.js';
import { TradingService } from '../trading/trading.service';
import {
  calculateBuyPrice,
  calculateSellPrice,
} from '../trading/bonding-curve';
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
        await this.checkUserProfit(user);
      }
    }
  }

  @OnEvent('memecoin.created')
  async handleCreate(memecoin: Memecoin) {
    // const users = await this.userRepository.find({
    //   where: { bot: true },
    // });
    // const user = users[Math.floor(Math.random() * users.length)];
    // console.log(
    //   '[Bot] Making initial purchase:',
    //   `Symbol: ${memecoin.symbol}`,
    //   `User: ${user.username}`,
    // );
    // await this.tradingService.tradeMemecoin(user.id, {
    //   memecoinId: memecoin.id,
    //   amount: '1',
    //   tradeType: 'buy',
    //   requestCost: calculateBuyPrice(
    //     '1',
    //     memecoin.totalSupply.toString(),
    //     memecoin.curveConfig,
    //   ),
    //   slippageTolerance: 0.01,
    // });
  }

  async checkUserProfit(user: User) {
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
      let totalCost = new Decimal(0);

      for (const transaction of transactions) {
        if (transaction.type === TransactionType.BUY) {
          bal = bal.plus(transaction.memecoinAmount);
          totalCost = totalCost.plus(transaction.zthAmount);
        } else if (transaction.type === TransactionType.SELL) {
          bal = bal.minus(transaction.memecoinAmount);
          totalCost = totalCost.minus(transaction.zthAmount);
        }
        actualTxs.push(transaction);
        if (bal.eq(holding.amount)) {
          break;
        }
      }

      const tradeParams: TradeMemecoinDto = {
        memecoinId: holding.memecoin.id,
        memecoinAmount: holding.amount,
        tradeType: 'sell',
        requestZthAmount: calculateSellPrice(
          holding.amount,
          holding.memecoin.totalSupply,
          holding.memecoin.curveConfig,
        ),
        slippageTolerance: 0.01,
      };
      const estimatedTrade =
        await this.tradingService.estimateTradeMemecoin(tradeParams);

      const profit = new Decimal(estimatedTrade.zthAmount).minus(totalCost);
      if (profit.gt(0)) {
        await this.tradingService.tradeMemecoin(user.id, tradeParams);

        console.log(
          `[Bot] selling ${tradeParams.memecoinAmount} ${holding.memecoin.symbol} tokens for user ${user.username} with profit of ${profit.toString()} ZTH`,
        );
      }
    }
  }
}
