import { Test, TestingModule } from '@nestjs/testing';
import { TradingController } from './trading.controller';
import { TradingService } from './trading.service';
import { BuyMemecoinDto } from './dto/buy-memecoin.dto';
import { SellMemecoinDto } from './dto/sell-memecoin.dto';
import { TradeResponseDto } from './dto/trade-response.dto';
import { TransactionType } from '../entities/transaction.entity';

describe('TradingController', () => {
  let controller: TradingController;
  let tradingService: TradingService;

  const mockTradeResponse: TradeResponseDto = {
    transactionId: 'transaction-id-1',
    type: TransactionType.BUY,
    memecoinId: 'memecoin-id-1',
    memecoinSymbol: 'TEST',
    amount: 100,
    price: 0.1,
    totalValue: 10,
    newBalance: 90,
    newHoldingAmount: 150,
    executedAt: new Date(),
  };

  const mockTradingService = {
    buyMemecoin: jest.fn().mockResolvedValue(mockTradeResponse),
    sellMemecoin: jest.fn().mockResolvedValue({
      ...mockTradeResponse,
      type: TransactionType.SELL,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TradingController],
      providers: [
        {
          provide: TradingService,
          useValue: mockTradingService,
        },
      ],
    }).compile();

    controller = module.get<TradingController>(TradingController);
    tradingService = module.get<TradingService>(TradingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('buyMemecoin', () => {
    it('should call tradingService.buyMemecoin with correct parameters', async () => {
      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'memecoin-id-1';
      buyDto.amount = 10;
      
      const req = { user: { id: 'user-id-1' } };
      
      await controller.buyMemecoin(req, buyDto);
      
      expect(tradingService.buyMemecoin).toHaveBeenCalledWith('user-id-1', buyDto);
    });

    it('should return the trade response from the service', async () => {
      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'memecoin-id-1';
      buyDto.amount = 10;
      
      const req = { user: { id: 'user-id-1' } };
      
      const result = await controller.buyMemecoin(req, buyDto);
      
      expect(result).toEqual(mockTradeResponse);
    });
  });

  describe('sellMemecoin', () => {
    it('should call tradingService.sellMemecoin with correct parameters', async () => {
      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = 10;
      
      const req = { user: { id: 'user-id-1' } };
      
      await controller.sellMemecoin(req, sellDto);
      
      expect(tradingService.sellMemecoin).toHaveBeenCalledWith('user-id-1', sellDto);
    });

    it('should return the trade response from the service', async () => {
      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = 10;
      
      const req = { user: { id: 'user-id-1' } };
      
      const result = await controller.sellMemecoin(req, sellDto);
      
      expect(result).toEqual({
        ...mockTradeResponse,
        type: TransactionType.SELL,
      });
    });
  });
});
