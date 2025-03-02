import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TradingController } from '../src/trading/trading.controller';
import { TradingService } from '../src/trading/trading.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';

// Mock data
const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
const mockMemecoin = { id: '1', name: 'Doge', symbol: 'DOGE', price: 100 };
const mockTransaction = {
  id: '1',
  userId: mockUser.id,
  memecoinId: mockMemecoin.id,
  amount: 10,
  price: 100,
  type: 'BUY',
  timestamp: new Date(),
};

describe('TradingController (e2e)', () => {
  let app: INestApplication;
  let tradingService: TradingService;

  beforeEach(async () => {
    // Create mock trading service
    const mockTradingService = {
      buyMemecoin: jest.fn().mockResolvedValue({
        ...mockTransaction,
        type: 'BUY',
      }),
      sellMemecoin: jest.fn().mockResolvedValue({
        ...mockTransaction,
        type: 'SELL',
      }),
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
      }
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TradingController],
      providers: [
        {
          provide: TradingService,
          useValue: mockTradingService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue(mockJwtAuthGuard)
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    tradingService = moduleFixture.get<TradingService>(TradingService);
    
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/trading/buy (POST)', () => {
    it('should return 403 if no authorization header is provided', () => {
      return request(app.getHttpServer())
        .post('/trading/buy')
        .send({
          memecoinId: '1',
          amount: 10,
        })
        .expect(403);
    });

    it('should return 400 if memecoinId is missing', () => {
      return request(app.getHttpServer())
        .post('/trading/buy')
        .set('Authorization', 'Bearer valid-token')
        .send({
          amount: 10,
        })
        .expect(400);
    });

    it('should return 400 if amount is missing', () => {
      return request(app.getHttpServer())
        .post('/trading/buy')
        .set('Authorization', 'Bearer valid-token')
        .send({
          memecoinId: '1',
        })
        .expect(400);
    });

    it('should return 400 if amount is not a positive number', () => {
      return request(app.getHttpServer())
        .post('/trading/buy')
        .set('Authorization', 'Bearer valid-token')
        .send({
          memecoinId: '1',
          amount: -10,
        })
        .expect(400);
    });

    it('should return 201 and transaction details on successful purchase', () => {
      return request(app.getHttpServer())
        .post('/trading/buy')
        .set('Authorization', 'Bearer valid-token')
        .send({
          memecoinId: '1',
          amount: 10,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('amount', 10);
          expect(res.body).toHaveProperty('type', 'BUY');
          expect(res.body).toHaveProperty('userId', mockUser.id);
          expect(res.body).toHaveProperty('memecoinId', mockMemecoin.id);
        });
    });
  });

  describe('/trading/sell (POST)', () => {
    it('should return 403 if no authorization header is provided', () => {
      return request(app.getHttpServer())
        .post('/trading/sell')
        .send({
          memecoinId: '1',
          amount: 10,
        })
        .expect(403);
    });

    it('should return 400 if memecoinId is missing', () => {
      return request(app.getHttpServer())
        .post('/trading/sell')
        .set('Authorization', 'Bearer valid-token')
        .send({
          amount: 10,
        })
        .expect(400);
    });

    it('should return 400 if amount is missing', () => {
      return request(app.getHttpServer())
        .post('/trading/sell')
        .set('Authorization', 'Bearer valid-token')
        .send({
          memecoinId: '1',
        })
        .expect(400);
    });

    it('should return 400 if amount is not a positive number', () => {
      return request(app.getHttpServer())
        .post('/trading/sell')
        .set('Authorization', 'Bearer valid-token')
        .send({
          memecoinId: '1',
          amount: -10,
        })
        .expect(400);
    });

    it('should return 201 and transaction details on successful sale', () => {
      return request(app.getHttpServer())
        .post('/trading/sell')
        .set('Authorization', 'Bearer valid-token')
        .send({
          memecoinId: '1',
          amount: 10,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('amount', 10);
          expect(res.body).toHaveProperty('type', 'SELL');
          expect(res.body).toHaveProperty('userId', mockUser.id);
          expect(res.body).toHaveProperty('memecoinId', mockMemecoin.id);
        });
    });
  });
}); 