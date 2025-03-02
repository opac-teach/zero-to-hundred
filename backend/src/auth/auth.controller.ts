import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ResetPasswordDto, ChangePasswordDto } from './dto';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'User with this email or username already exists' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset instructions sent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @ApiOperation({ summary: 'Change password with token' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  @Post('change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(changePasswordDto);
  }
}
