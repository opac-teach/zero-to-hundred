import { Controller, Get, Param, Put, Body, UseGuards, Request, NotFoundException, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users', type: [UserResponseDto] })
  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Return the user', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'The ID of the user' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: 'Get user by username' })
  @ApiResponse({ status: 200, description: 'Return the user', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'username', description: 'The username of the user' })
  @Get('username/:username')
  async findByUsername(@Param('username') username: string): Promise<UserResponseDto> {
    return this.userService.findByUsername(username);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return the current user', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  async getProfile(@Request() req): Promise<UserResponseDto> {
    return this.userService.findOne(req.user.id);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Return the updated user', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('me/profile')
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(req.user.id, updateUserDto);
  }

  @ApiOperation({ summary: 'Get user leaderboard' })
  @ApiResponse({ status: 200, description: 'Return the leaderboard', type: [UserResponseDto] })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', type: Number })
  @Get('leaderboard')
  async getLeaderboard(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<UserResponseDto[]> {
    return this.userService.getLeaderboard(page, limit);
  }
}
