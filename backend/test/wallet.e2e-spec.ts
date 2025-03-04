import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { WalletController } from '../src/wallet/wallet.controller';
import { WalletService } from '../src/wallet/wallet.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';

// Mock data
const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
const mockWallet = {
  id: '1',
  ownerId: mockUser.id,
  zthBalance: 1000,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const mockWalletHolding = {
  id: '1',
  walletId: mockWallet.id,
  memecoinId: '1',
  amount: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('WalletController (e2e)', () => {
  let app: INestApplication;
  let walletService: WalletService;

  beforeEach(async () => {
    // Create mock wallet service
    const mockWalletService = {
      getWallet: jest.fn().mockResolvedValue(mockWallet),
      getWalletHoldings: jest.fn().mockResolvedValue([mockWalletHolding]),
      updateWalletBalance: jest.fn().mockResolvedValue(mockWallet),
    };

    // Mock JwtAuthGuard
    const mockJwtAuthGuard = {
      canActivate: (context) => {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return false;
        }

        // Set user in request
        request.user = mockUser;
        return true;
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    walletService = moduleFixture.get<WalletService>(WalletService);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/wallet (GET)', () => {
    it('should return 403 if no authorization header is provided', () => {
      return request(app.getHttpServer()).get('/wallet').expect(403);
    });

    it('should return 200 and wallet details on successful request', () => {
      return request(app.getHttpServer())
        .get('/wallet')
        .set('Authorization', 'Bearer valid-token')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', mockWallet.id);
          expect(res.body).toHaveProperty('zthBalance', mockWallet.zthBalance);
          expect(res.body).toHaveProperty('ownerId', mockUser.id);
          expect(res.body).toHaveProperty('isActive', true);
        });
    });
  });

  describe('/wallet/holdings (GET)', () => {
    it('should return 403 if no authorization header is provided', () => {
      return request(app.getHttpServer()).get('/wallet/holdings').expect(403);
    });

    it('should return 200 and wallet holdings on successful request', () => {
      return request(app.getHttpServer())
        .get('/wallet/holdings')
        .set('Authorization', 'Bearer valid-token')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body[0]).toHaveProperty('id', mockWalletHolding.id);
          expect(res.body[0]).toHaveProperty('walletId', mockWallet.id);
          expect(res.body[0]).toHaveProperty('memecoinId', '1');
          expect(res.body[0]).toHaveProperty('amount', 10);
        });
    });
  });

  describe('/wallet/balance (PATCH)', () => {
    it('should return 403 if no authorization header is provided', () => {
      return request(app.getHttpServer())
        .patch('/wallet/balance')
        .send({
          amount: 100,
          type: 'ADD',
        })
        .expect(403);
    });

    it('should return 400 if amount is missing', () => {
      return request(app.getHttpServer())
        .patch('/wallet/balance')
        .set('Authorization', 'Bearer valid-token')
        .send({
          type: 'ADD',
        })
        .expect(400);
    });

    it('should return 400 if type is missing', () => {
      return request(app.getHttpServer())
        .patch('/wallet/balance')
        .set('Authorization', 'Bearer valid-token')
        .send({
          amount: 100,
        })
        .expect(400);
    });

    it('should return 400 if type is not ADD or SUBTRACT', () => {
      return request(app.getHttpServer())
        .patch('/wallet/balance')
        .set('Authorization', 'Bearer valid-token')
        .send({
          amount: 100,
          type: 'INVALID',
        })
        .expect(400);
    });

    it('should return 200 and updated wallet on successful balance update', () => {
      return request(app.getHttpServer())
        .patch('/wallet/balance')
        .set('Authorization', 'Bearer valid-token')
        .send({
          amount: 100,
          type: 'ADD',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', mockWallet.id);
          expect(res.body).toHaveProperty('zthBalance', mockWallet.zthBalance);
          expect(res.body).toHaveProperty('ownerId', mockUser.id);
        });
    });
  });
});
