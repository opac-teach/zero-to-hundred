import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import {
  RegisterDto,
  ResetPasswordDto,
  ChangePasswordDto,
  AuthResponseDto,
} from './dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async register(createUserDto: RegisterDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Create a wallet for the user
    const wallet = this.walletRepository.create({
      ownerId: savedUser.id,
      zthBalance: '0',
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
    });

    await this.walletRepository.save(wallet);

    return new UserResponseDto({
      ...savedUser,
      zthBalance: 0,
    });
  }

  async login(user: Omit<User, 'password'>): Promise<AuthResponseDto> {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      userId: user.id,
      username: user.username,
      email: user.email,
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = resetPasswordDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate reset token
    const resetToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '1h' },
    );

    // TODO: Send reset email with token

    return { message: 'Password reset instructions sent' };
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { token, password, confirmPassword } = changePasswordDto;

    if (password !== confirmPassword) {
      throw new UnauthorizedException('Passwords do not match');
    }

    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;

      await this.userRepository.save(user);

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
