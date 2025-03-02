import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { TradingVolumeDto } from './dto';

describe('StatisticsController', () => {
  let controller: StatisticsController;
  let service: StatisticsService;

  const mockStatisticsService = {
    getTradingVolume: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [
        {
          provide: StatisticsService,
          useValue: mockStatisticsService,
        },
      ],
    }).compile();

    controller = module.get<StatisticsController>(StatisticsController);
    service = module.get<StatisticsService>(StatisticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTradingVolume', () => {
    it('should return trading volume statistics', async () => {
      const result: TradingVolumeDto = {
        totalVolume: 1000,
        buyVolume: 600,
        sellVolume: 400,
        timeframe: '24h',
        memecoins: [],
      };

      jest.spyOn(service, 'getTradingVolume').mockResolvedValue(result);

      expect(await controller.getTradingVolume()).toEqual(result);
      expect(service.getTradingVolume).toHaveBeenCalledWith('24h', undefined);
    });

    it('should return trading volume statistics for a specific timeframe', async () => {
      const result: TradingVolumeDto = {
        totalVolume: 5000,
        buyVolume: 3000,
        sellVolume: 2000,
        timeframe: '7d',
        memecoins: [],
      };

      jest.spyOn(service, 'getTradingVolume').mockResolvedValue(result);

      expect(await controller.getTradingVolume('7d')).toEqual(result);
      expect(service.getTradingVolume).toHaveBeenCalledWith('7d', undefined);
    });

    it('should return trading volume statistics for a specific memecoin', async () => {
      const result: TradingVolumeDto = {
        totalVolume: 500,
        buyVolume: 300,
        sellVolume: 200,
        timeframe: '24h',
        memecoins: [],
      };

      jest.spyOn(service, 'getTradingVolume').mockResolvedValue(result);

      expect(await controller.getTradingVolume('24h', 'memecoin-id')).toEqual(result);
      expect(service.getTradingVolume).toHaveBeenCalledWith('24h', 'memecoin-id');
    });
  });
}); 