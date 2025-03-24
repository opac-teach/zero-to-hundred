import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { Repository, DataSource } from 'typeorm';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto';

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
  let userService: UserService;
  let dataSource: DataSource;

  const mockWallet = {
    id: 'wallet-id-1',
    ownerId: 'user-id-1',
    zthBalance: '1000',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: null,
    holdings: [],
  } as Wallet;

  const mockUser = {
    id: 'user-id-1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    userTitle: 'Test User',
    role: 'user',
    profilePictureUrl: 'https://example.com/pic.jpg',
    bannerUrl: 'https://example.com/banner.jpg',
    description: 'Test user description',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    wallet: mockWallet,
  } as User;

  mockWallet.owner = mockUser;

  const mockUserRepository = {
    findOne: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockReturnValue(mockUser),
    save: jest.fn().mockResolvedValue(mockUser),
  };

  const mockWalletRepository = {
    create: jest.fn().mockReturnValue({ id: 'wallet-id-1', balance: 100 }),
    save: jest.fn().mockResolvedValue({
      id: 'wallet-id-1',
      balance: 100,
    }),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('jwt-token'),
    verify: jest.fn().mockReturnValue({ sub: 'user-id-1' }),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('jwt-secret'),
  };

  const mockQueryRunner = {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager: {
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
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
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        UserService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    walletRepository = module.get<Repository<Wallet>>(
      getRepositoryToken(Wallet),
    );
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    userService = module.get<UserService>(UserService);
    dataSource = module.get<DataSource>(DataSource);

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
      expect('password' in result).toBe(false);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        mockUser.password,
      );
    });

    it('should return null when user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'password',
      );

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

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
        userTitle: 'New User',
      };

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('jwt-token');
      expect(result.userId).toBe(mockUser.id);
      expect(result.username).toBe(mockUser.username);
      expect(result.email).toBe(mockUser.email);
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'newuser',
          email: 'new@example.com',
          password: 'hashedpassword',
        }),
      );

      // Verify transaction behavior
      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(2); // Once for user, once for wallet
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });

    it('should throw ConflictException when user already exists', async () => {
      await expect(
        service.register({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password',
          userTitle: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        userTitle: 'Test User',
      };

      // Mock findOne to return null for this test case
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('jwt-token');
      expect(result.userId).toBe(mockUser.id);
      expect(result.username).toBe(mockUser.username);
      expect(result.email).toBe(mockUser.email);
      expect(Object.prototype.hasOwnProperty.call(result, 'password')).toBe(
        false,
      );

      // Verify transaction behavior
      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      mockQueryRunner.manager.save.mockRejectedValueOnce(
        new Error('Database error'),
      );

      const registerDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password',
        userTitle: 'New User',
      };

      await expect(service.register(registerDto)).rejects.toThrow(
        'Database error',
      );

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return JWT token and user info', async () => {
      const { password, ...userWithoutPassword } = mockUser;
      const result = await service.login(userWithoutPassword);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('jwt-token');
      expect(result.userId).toBe(mockUser.id);
      expect(result.username).toBe(mockUser.username);
      expect(result.email).toBe(mockUser.email);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'password')).toBe(
        false,
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
      expect(result.message).toBe('Password reset instructions sent');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        service.resetPassword({
          email: 'nonexistent@example.com',
        }),
      ).rejects.toThrow(NotFoundException);
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
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when passwords do not match', async () => {
      await expect(
        service.changePassword({
          token: 'valid-token',
          password: 'newpassword',
          confirmPassword: 'different',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      await expect(
        service.changePassword({
          token: 'invalid-token',
          password: 'newpassword',
          confirmPassword: 'newpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
