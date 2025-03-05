import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import {
  RegisterDto,
  ResetPasswordDto,
  ChangePasswordDto,
  AuthResponseDto,
} from './dto';
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
    private dataSource: DataSource,
  ) {}
  private readonly logger = new Logger(AuthService.name);

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

  async register(createUserDto: RegisterDto): Promise<AuthResponseDto> {
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

    // Use a transaction to ensure both user and wallet are created atomically
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create and save user within transaction
      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      const savedUser = await queryRunner.manager.save(user);

      this.logger.log(
        `Creating new wallet with initial balance: ${this.configService.get('initialZTHBalance')} ZTH`,
      );
      // Create and save wallet within the same transaction
      const wallet = this.walletRepository.create({
        ownerId: savedUser.id,
        zthBalance: this.configService.get('initialZTHBalance'),
      });

      await queryRunner.manager.save(wallet);

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Generate JWT token
      const payload = { sub: savedUser.id, email: savedUser.email };
      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        userId: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
      };
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
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
