import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {
  PrivateUserResponseDto,
  PublicUserResponseDto,
  UserProfileResponseDto,
} from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { plainToInstance } from 'class-transformer';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockPublicUserResponse = {
    id: 'user-id-1',
    username: 'testuser',
    userTitle: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockPrivateUserResponse = {
    ...mockPublicUserResponse,
    email: 'test@example.com',
  };
  const mockFullUserResponse = {
    ...mockPrivateUserResponse,
    password: 'password',
  };

  const mockLeaderboardResponse = {
    users: [mockPublicUserResponse],
    total: 1,
  };

  const mockUserProfileResponse = {
    ...mockPublicUserResponse,
    wallet: {
      zthBalance: '1000',
      holdings: [
        {
          amount: '100',
          memecoin: { id: 'memecoin-id-1', name: 'Test Memecoin' },
        },
      ],
    },
    transactions: [
      {
        type: 'buy',
        memecoin: { id: 'memecoin-id-1', name: 'Test Memecoin' },
      },
    ],
  };
  const mockUserService = {
    findAll: jest.fn().mockResolvedValue([mockFullUserResponse]),
    findOne: jest.fn().mockResolvedValue(mockFullUserResponse),
    findByUsername: jest.fn().mockResolvedValue(mockFullUserResponse),
    getUserProfile: jest.fn().mockResolvedValue(mockUserProfileResponse),
    update: jest.fn().mockResolvedValue(mockFullUserResponse),
    getLeaderboard: jest.fn().mockResolvedValue(mockLeaderboardResponse),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      let result = await controller.findAll();
      result[0] = plainToInstance(PublicUserResponseDto, result[0], {
        excludeExtraneousValues: true,
      });
      expect(result[0]).toEqual(mockPublicUserResponse);
      expect(userService.findAll).toHaveBeenCalled();
    });
  });

  describe('getUserProfile', () => {
    it('should return a user by username', async () => {
      let result = await controller.getUserProfile('testuser');
      result = plainToInstance(UserProfileResponseDto, result, {
        excludeExtraneousValues: true,
      });
      expect(result).toEqual(mockUserProfileResponse);
      expect(userService.getUserProfile).toHaveBeenCalledWith('testuser');
    });
  });

  describe('get my Profile', () => {
    it('should return the current user profile', async () => {
      const req = { user: { id: 'user-id-1' } };

      let result = await controller.getMyProfile(req);
      result = plainToInstance(PrivateUserResponseDto, result, {
        excludeExtraneousValues: true,
      });
      expect(result).toEqual(mockPrivateUserResponse);
      expect(userService.findOne).toHaveBeenCalledWith('user-id-1');
    });
  });

  describe('updateProfile', () => {
    it('should update the current user profile', async () => {
      const req = { user: { id: 'user-id-1' } };
      const updateUserDto: UpdateUserDto = { userTitle: 'Updated Name' };

      let result = await controller.updateProfile(req, updateUserDto);
      result = plainToInstance(PrivateUserResponseDto, result, {
        excludeExtraneousValues: true,
      });
      expect(result).toEqual(mockPrivateUserResponse);
      expect(userService.update).toHaveBeenCalledWith(
        'user-id-1',
        updateUserDto,
      );
    });
  });

  describe('getLeaderboard', () => {
    it('should return the user leaderboard with default pagination', async () => {
      const result = await controller.getLeaderboard(1, 20);

      expect(result).toEqual(mockLeaderboardResponse);
      expect(userService.getLeaderboard).toHaveBeenCalledWith(1, 20);
    });

    it('should return the user leaderboard with custom pagination', async () => {
      const result = await controller.getLeaderboard(2, 10);

      expect(result).toEqual(mockLeaderboardResponse);
      expect(userService.getLeaderboard).toHaveBeenCalledWith(2, 10);
    });
  });
});
