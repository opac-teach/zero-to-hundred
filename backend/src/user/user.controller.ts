import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  PublicUserResponseDto,
  PrivateUserResponseDto,
  UserProfileResponseDto,
} from './dto/user-response.dto';
import { LeaderboardDto } from './dto/leaderboard.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Return all users',
    type: [PublicUserResponseDto],
  })
  @Get()
  async findAll(): Promise<PublicUserResponseDto[]> {
    const users = await this.userService.findAll();
    return users.map((user) => new PublicUserResponseDto(user));
  }

  @ApiOperation({ summary: 'Get user leaderboard' })
  @ApiResponse({
    status: 200,
    description: 'Return the leaderboard',
    type: LeaderboardDto,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  @Get('leaderboard')
  async getLeaderboard(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<LeaderboardDto> {
    return this.userService.getLeaderboard(page, limit);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Return the current user',
    type: PublicUserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@Request() req): Promise<PrivateUserResponseDto> {
    const user = await this.userService.findOne(req.user.id);
    return new PrivateUserResponseDto(user);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Return the updated user',
    type: PublicUserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<PrivateUserResponseDto> {
    const user = await this.userService.update(req.user.id, updateUserDto);
    return new PrivateUserResponseDto(user);
  }

  @ApiOperation({ summary: 'Get user profile by username' })
  @ApiResponse({
    status: 200,
    description: 'Return the user',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'username', description: 'The username of the user' })
  @Get('username/:username')
  async getUserProfile(
    @Param('username') username: string,
  ): Promise<UserProfileResponseDto> {
    return this.userService.getUserProfile(username);
  }
}
