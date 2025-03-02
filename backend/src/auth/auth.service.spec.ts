import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, ResetPasswordDto, ChangePasswordDto } from './dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('hashedpassword'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let walletRepository: Repository<Wallet>;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser = {
    id: 'user-id-1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    fullName: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepository = {
    findOne: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockReturnValue(mockUser),
    save: jest.fn().mockResolvedValue(mockUser),
  };

  const mockWalletRepository = {
    create: jest.fn().mockReturnValue({ id: 'wallet-id-1', address: 'address', balance: 100 }),
    save: jest.fn().mockResolvedValue({ id: 'wallet-id-1', address: 'address', balance: 100 }),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('jwt-token'),
    verify: jest.fn().mockReturnValue({ sub: 'user-id-1' }),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('jwt-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    walletRepository = module.get<Repository<Wallet>>(getRepositoryToken(Wallet));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      
      const result = await service.validateUser('test@example.com', 'password');
      
      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.password).toBeUndefined();
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', mockUser.password);
    });

    it('should return null when user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      
      const result = await service.validateUser('nonexistent@example.com', 'password');
      
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      
      const result = await service.validateUser('test@example.com', 'wrongpassword');
      
      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('should create a new user and wallet', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      
      const registerDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password',
        fullName: 'New User',
      };
      
      const result = await service.register(registerDto);
      
      expect(result).toBeDefined();
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        username: 'newuser',
        email: 'new@example.com',
        password: 'hashedpassword',
      }));
      expect(userRepository.save).toHaveBeenCalled();
      expect(walletRepository.create).toHaveBeenCalled();
      expect(walletRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when user already exists', async () => {
      await expect(service.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        fullName: 'Test User',
      })).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return JWT token', async () => {
      const result = await service.login({ id: 'user-id-1', username: 'testuser', email: 'test@example.com' });
      
      expect(result).toBeDefined();
      expect(result.access_token).toBe('jwt-token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: 'test@example.com', sub: 'user-id-1' },
        { secret: 'jwt-secret', expiresIn: '1d' }
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset user password', async () => {
      const resetPasswordDto = {
        email: 'test@example.com',
      };
      
      const result = await service.resetPassword(resetPasswordDto);
      
      expect(result).toBeDefined();
      expect(result.message).toBe('Password reset instructions sent to your email');
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      
      await expect(service.resetPassword({
        email: 'nonexistent@example.com',
      })).rejects.toThrow(NotFoundException);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        token: 'valid-token',
        password: 'newpassword',
        confirmPassword: 'newpassword',
      };
      
      const result = await service.changePassword(changePasswordDto);
      
      expect(result).toBeDefined();
      expect(result.message).toBe('Password changed successfully');
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });
      
      await expect(service.changePassword({
        token: 'invalid-token',
        password: 'newpassword',
        confirmPassword: 'newpassword',
      })).rejects.toThrow(UnauthorizedException);
    });
  });
});
