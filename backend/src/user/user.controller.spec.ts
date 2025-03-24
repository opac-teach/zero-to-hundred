import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MyUserResponseDto, UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserResponse = new UserResponseDto({
    id: 'user-id-1',
    username: 'testuser',
    userTitle: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const mockMyUserResponse = new MyUserResponseDto({
    ...mockUserResponse,
    email: 'test@example.com',
  });

  const mockLeaderboardResponse = {
    users: [mockUserResponse],
    total: 1,
  };

  const mockUserService = {
    findAll: jest.fn().mockResolvedValue([mockUserResponse]),
    findOne: jest.fn().mockResolvedValue(mockUserResponse),
    findByUsername: jest.fn().mockResolvedValue(mockUserResponse),
    update: jest.fn().mockResolvedValue(mockUserResponse),
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
      const result = await controller.findAll();

      expect(result).toEqual([mockUserResponse]);
      expect(userService.findAll).toHaveBeenCalled();
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      const result = await controller.findByUsername('testuser');

      expect(result).toEqual(mockUserResponse);
      expect(userService.findByUsername).toHaveBeenCalledWith('testuser');
    });
  });

  describe('getProfile', () => {
    it('should return the current user profile', async () => {
      const req = { user: { id: 'user-id-1' } };

      const result = await controller.getProfile(req);

      expect(result).toEqual(mockMyUserResponse);
      expect(userService.findOne).toHaveBeenCalledWith('user-id-1');
    });
  });

  describe('updateProfile', () => {
    it('should update the current user profile', async () => {
      const req = { user: { id: 'user-id-1' } };
      const updateUserDto: UpdateUserDto = { userTitle: 'Updated Name' };

      const result = await controller.updateProfile(req, updateUserDto);

      expect(result).toEqual(mockMyUserResponse);
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
