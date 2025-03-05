import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Wallet } from '../entities/wallet.entity';
import { BigNumber } from 'bignumber.js';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return users.map((user) => new UserResponseDto(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return new UserResponseDto(user);
  }

  async findByUsername(username: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    return new UserResponseDto(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if username is being updated and if it's already taken
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });

      if (existingUser) {
        throw new ConflictException(
          `Username ${updateUserDto.username} is already taken`,
        );
      }
    }

    // Update user properties
    Object.assign(user, updateUserDto);

    const updatedUser = await this.userRepository.save(user);
    return new UserResponseDto(updatedUser);
  }

  async getLeaderboard(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ users: UserResponseDto[]; total: number }> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.wallet', 'wallet')
      .orderBy('wallet.zthBalance', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await Promise.all([
      queryBuilder.getMany(),
      this.userRepository.count(),
    ]);

    const usersWithRank = users.map((user, index) => ({
      ...user,
      rank: (page - 1) * limit + index + 1,
      zthBalance: new BigNumber(user.wallet?.zthBalance || '0').toNumber(),
    }));

    return {
      users: usersWithRank.map((user) => new UserResponseDto(user)),
      total,
    };
  }
}
