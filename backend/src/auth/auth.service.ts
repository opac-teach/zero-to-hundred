import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { RegisterDto, LoginDto, ResetPasswordDto, ChangePasswordDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

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

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }

  async register(registerDto: RegisterDto): Promise<any> {
    const { username, email, password, fullName } = registerDto;
    
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });
    
    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      fullName,
    });
    
    const savedUser = await this.userRepository.save(user);
    
    // Create wallet for the user with initial balance of 100 ZTH
    const wallet = this.walletRepository.create({
      address: uuidv4(),
      balance: 100, // Initial balance of 100 ZTH
      owner: savedUser,
      ownerId: savedUser.id,
    });
    
    await this.walletRepository.save(wallet);
    
    // Return user without password
    const { password: _, ...result } = savedUser;
    return result;
  }

  async login(user: any): Promise<{ access_token: string }> {
    const payload = { email: user.email, sub: user.id };
    
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '1d',
      }),
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { email } = resetPasswordDto;
    
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // In a real application, you would send an email with a reset token
    // For this example, we'll just return a success message
    
    return { message: 'Password reset instructions sent to your email' };
  }

  async changePassword(changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { token, password, confirmPassword } = changePasswordDto;
    
    if (password !== confirmPassword) {
      throw new UnauthorizedException('Passwords do not match');
    }
    
    try {
      // Verify token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Update user password
      user.password = hashedPassword;
      await this.userRepository.save(user);
      
      return { message: 'Password changed successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
