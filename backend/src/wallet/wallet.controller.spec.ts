import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletResponseDto, TransactionResponseDto } from './dto';

describe('WalletController', () => {
  let controller: WalletController;
  let walletService: WalletService;

  const mockWalletResponse = {
    id: 'wallet-id-1',
    address: 'wallet-address',
    balance: 100,
    holdings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransactionResponse = {
    id: 'transaction-id-1',
    type: 'BUY',
    amount: 10,
    price: 1,
    totalValue: 10,
    memecoinId: 'memecoin-id-1',
    memecoinSymbol: 'TEST',
    walletId: 'wallet-id-1',
    executedAt: new Date(),
  };

  const mockWalletService = {
    getWalletByUserId: jest.fn().mockResolvedValue(mockWalletResponse),
    getTransactionsByUserId: jest.fn().mockResolvedValue([mockTransactionResponse]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
      ],
    }).compile();

    controller = module.get<WalletController>(WalletController);
    walletService = module.get<WalletService>(WalletService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getWallet', () => {
    it('should return the user wallet', async () => {
      const req = { user: { id: 'user-id-1' } };
      
      const result = await controller.getWallet(req);
      
      expect(result).toEqual(mockWalletResponse);
      expect(walletService.getWalletByUserId).toHaveBeenCalledWith('user-id-1');
    });
  });

  describe('getTransactions', () => {
    it('should return the user transactions', async () => {
      const req = { user: { id: 'user-id-1' } };
      
      const result = await controller.getTransactions(req);
      
      expect(result).toEqual([mockTransactionResponse]);
      expect(walletService.getTransactionsByUserId).toHaveBeenCalledWith('user-id-1');
    });
  });
});
