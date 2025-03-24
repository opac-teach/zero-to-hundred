import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { Wallet } from '../entities/wallet.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

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

  const mockUsers = [
    mockUser,
    {
      id: 'user-id-2',
      username: 'testuser2',
      email: 'test2@example.com',
      password: 'hashedpassword',
      userTitle: 'Test User 2',
      role: 'user',
      profilePictureUrl: null,
      bannerUrl: null,
      description: null,
      backgroundColor: '#f5f5f5',
      textColor: '#333333',
      isActive: true,
      zthBalance: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockUserRepository = {
    find: jest.fn().mockResolvedValue(mockUsers),
    findOne: jest.fn().mockResolvedValue(mockUser),
    save: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockReturnValue(mockUser),
    count: jest.fn().mockResolvedValue(2),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockUsers),
    })),
  };

  const mockWalletRepository = {
    find: jest.fn().mockResolvedValue([mockWallet]),
    findOne: jest.fn().mockResolvedValue(mockWallet),
    save: jest.fn().mockResolvedValue(mockWallet),
    create: jest.fn().mockReturnValue(mockWallet),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(userRepository.find).toHaveBeenCalledWith({
        order: {
          createdAt: 'DESC',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = await service.findOne('user-id-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('user-id-1');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      const result = await service.findByUsername('testuser');

      expect(result).toBeDefined();
      expect(result.username).toBe('testuser');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.findByUsername('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        userTitle: 'Updated Name',
      };

      const result = await service.update('user-id-1', updateUserDto);

      expect(result).toBeDefined();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
      });
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        service.update('nonexistent-id', { userTitle: 'Updated Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when username is already taken', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'existinguser',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce({ id: 'user-id-2' } as unknown as User);

      await expect(service.update('user-id-1', updateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getLeaderboard', () => {
    it('should return a leaderboard of users with total count', async () => {
      const mockUsers = [
        { id: '1', username: 'user1', wallet: { zthBalance: 100 } },
        { id: '2', username: 'user2', wallet: { zthBalance: 50 } },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockUsers),
      };

      userRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);
      userRepository.count = jest.fn().mockResolvedValue(2);

      const result = await service.getLeaderboard();

      expect(result.leaderboard.length).toBe(2);
      expect(result.total).toBe(2);
      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'user.wallet',
        'wallet',
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'wallet.zthBalance',
        'DESC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });

    it('should respect pagination parameters', async () => {
      const mockUsers = [
        { id: '1', username: 'user1', wallet: { zthBalance: 100 } },
        { id: '2', username: 'user2', wallet: { zthBalance: 50 } },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockUsers),
      };

      userRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);
      userRepository.count = jest.fn().mockResolvedValue(2);

      const page = 2;
      const limit = 10;
      await service.getLeaderboard(page, limit);

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'user.wallet',
        'wallet',
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'wallet.zthBalance',
        'DESC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });
  });
});
