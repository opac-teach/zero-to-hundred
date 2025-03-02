import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ResetPasswordDto, ChangePasswordDto } from './dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn().mockResolvedValue({ id: 'user-id', accessToken: 'token' }),
    login: jest.fn().mockResolvedValue({ accessToken: 'token' }),
    resetPassword: jest.fn().mockResolvedValue({ message: 'Reset instructions sent' }),
    changePassword: jest.fn().mockResolvedValue({ message: 'Password changed' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        fullName: 'Test User',
      };

      const result = await controller.register(registerDto);

      expect(result).toEqual({ id: 'user-id', accessToken: 'token' });
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login a user and return access token', async () => {
      const req = {
        user: {
          id: 'user-id',
          username: 'testuser',
          email: 'test@example.com',
        },
      };

      const result = await controller.login(req);

      expect(result).toEqual({ accessToken: 'token' });
      expect(authService.login).toHaveBeenCalledWith(req.user);
    });
  });

  describe('resetPassword', () => {
    it('should request password reset', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        email: 'test@example.com',
      };

      const result = await controller.resetPassword(resetPasswordDto);

      expect(result).toEqual({ message: 'Reset instructions sent' });
      expect(authService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    });
  });

  describe('changePassword', () => {
    it('should change password with token', async () => {
      const changePasswordDto: ChangePasswordDto = {
        token: 'reset-token',
        password: 'newpassword',
        confirmPassword: 'newpassword',
      };

      const result = await controller.changePassword(changePasswordDto);

      expect(result).toEqual({ message: 'Password changed' });
      expect(authService.changePassword).toHaveBeenCalledWith(changePasswordDto);
    });
  });
});
