import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  const mockUser = {
    id: 'user-id-1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    fullName: 'Test User',
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
  };

  const mockUsers = [
    mockUser,
    {
      id: 'user-id-2',
      username: 'testuser2',
      email: 'test2@example.com',
      password: 'hashedpassword',
      fullName: 'Test User 2',
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
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
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-id-1' } });
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      const result = await service.findByUsername('testuser');
      
      expect(result).toBeDefined();
      expect(result.username).toBe('testuser');
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      
      await expect(service.findByUsername('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        fullName: 'Updated Name',
      };
      
      const result = await service.update('user-id-1', updateUserDto);
      
      expect(result).toBeDefined();
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-id-1' } });
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      
      await expect(service.update('nonexistent-id', { fullName: 'Updated Name' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when username is already taken', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'existinguser',
      };
      
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({ id: 'user-id-2' } as unknown as User);
      
      await expect(service.update('user-id-1', updateUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getLeaderboard', () => {
    it('should return a leaderboard of users', async () => {
      const result = await service.getLeaderboard();
      
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(userRepository.find).toHaveBeenCalledWith({
        order: {
          zthBalance: 'DESC',
        },
        skip: 0,
        take: 20,
      });
    });

    it('should respect pagination parameters', async () => {
      const page = 2;
      const limit = 10;
      
      await service.getLeaderboard(page, limit);
      
      expect(userRepository.find).toHaveBeenCalledWith({
        order: {
          zthBalance: 'DESC',
        },
        skip: 10,
        take: 10,
      });
    });
  });
});
