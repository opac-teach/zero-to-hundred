import { Test, TestingModule } from '@nestjs/testing';
import { BotService } from './bot.service';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import Decimal from 'decimal.js';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Memecoin } from '../entities/memecoin.entity';
import { User } from '../entities/user.entity';
import { WalletHolding } from '../entities/wallet-holding.entity';
import { Repository } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { TradingService } from '../trading/trading.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('BotService', () => {
  let service: BotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BotService,
        TradingService,
        {
          provide: getRepositoryToken(Memecoin),
          useValue: {} as Repository<Memecoin>,
        },
        {
          provide: getRepositoryToken(User),
          useValue: {} as Repository<User>,
        },
        {
          provide: getRepositoryToken(Wallet),
          useValue: {} as Repository<Wallet>,
        },
        {
          provide: getRepositoryToken(WalletHolding),
          useValue: {} as Repository<WalletHolding>,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: {} as Repository<Transaction>,
        },
        {
          provide: DataSource,
          useValue: {} as DataSource,
        },
        EventEmitter2,
      ],
    }).compile();

    service = module.get<BotService>(BotService);
  });

  const txBase = {
    type: TransactionType.BUY,
    memecoinAmount: '1',
    zthAmount: '100',
    createdAt: new Date(),
    id: '1',
    userId: '1',
    memecoinId: '1',
    price: '100',
  };
  it('should extract relevant txs - 1', async () => {
    const holdingAmount = '3';

    const txs: Transaction[] = [
      {
        ...txBase,
        id: '1',
        type: TransactionType.BUY,
        memecoinAmount: '2',
        zthAmount: '2',
      },
      {
        ...txBase,
        id: '2',
        type: TransactionType.SELL,
        memecoinAmount: '1',
        zthAmount: '1',
      },
      {
        ...txBase,
        id: '3',
        type: TransactionType.BUY,
        memecoinAmount: '2',
        zthAmount: '2',
      },
      {
        ...txBase,
        id: '4',
        type: TransactionType.SELL,
        memecoinAmount: '932',
        zthAmount: '220',
      },
      {
        ...txBase,
        id: '5',
        type: TransactionType.BUY,
        memecoinAmount: '20',
        zthAmount: '2440',
      },
    ];
    const totalCost = await service.getHoldingCost(txs, holdingAmount);
    expect(totalCost).toEqual(new Decimal(3));
  });
});
