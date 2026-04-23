import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Statistics } from '../statistics/entities/statistics.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { verifyAspNetPassword, hashAspNetPassword } from '../utils/password.util';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Statistics)
    private statisticsRepository: Repository<Statistics>,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user && verifyAspNetPassword(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({ where: { email: loginDto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await verifyAspNetPassword(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailConfirmed) {
      throw new UnauthorizedException('Please confirm your email before logging in');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        userName: user.userName,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({ where: { email: registerDto.email } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = hashAspNetPassword(registerDto.password);

    // Generate a GUID-like ID for new users
    const newId = this.generateGuid();

    const newUser = this.usersRepository.create({
      id: newId,
      email: registerDto.email,
      passwordHash,
      userName: registerDto.userName || registerDto.email,
      emailConfirmed: false,
      lockoutEnabled: true,
    });

    const savedUser = await this.usersRepository.save(newUser);

    // Create statistics record with default email settings
    const stats = this.statisticsRepository.create({
      userId: savedUser.id,
      bankBalance: 2000,
      pilotScore: 5,
      sendLicenseWarning: true,
      sendAirlineBillsWarning: true,
      licenseWarningSent: false,
      airlineBillsWarningSent: false,
    });
    await this.statisticsRepository.save(stats);

    // Send welcome email
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
      const confirmationLink = `${frontendUrl}/confirm-email?userId=${savedUser.id}`;

      await this.mailService.sendWelcomeEmail({
        userName: savedUser.userName,
        userEmail: savedUser.email,
        confirmationLink,
      });

      this.logger.log(`Welcome email queued for ${savedUser.email}`);
    } catch (error) {
      // Don't fail registration if email fails
      this.logger.error(`Failed to send welcome email to ${savedUser.email}:`, error);
    }

    // Don't return token automatically - user must confirm email first
    return {
      message: 'Registration successful. Please check your email to confirm your account.',
      user: {
        id: savedUser.id,
        email: savedUser.email,
        userName: savedUser.userName,
        emailConfirmed: savedUser.emailConfirmed,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const { passwordHash, ...result } = user;
    return result;
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } });
    
    if (!user) {
      // Don't reveal if email exists
      this.logger.log(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    if (!user.emailConfirmed) {
      this.logger.log(`Password reset requested for unconfirmed email: ${email}`);
      return;
    }

    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
      const resetToken = this.generateGuid(); // In production, use crypto secure token
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
      
      await this.mailService.sendPasswordResetEmail({
        userName: user.userName,
        userEmail: user.email,
        resetLink,
        expiresIn: '24 hours',
      });
      
      this.logger.log(`Password reset email queued for ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      throw new Error('Failed to send password reset email');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, email, newPassword } = resetPasswordDto;

    // Find user by email
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('Invalid email or token');
    }

    // Note: In production, you should store the token with expiration in the database
    // For now, we'll accept any token (not secure for production)
    // TODO: Implement proper token storage with expiration

    // Hash new password
    const newPasswordHash = hashAspNetPassword(newPassword);

    // Update user password
    user.passwordHash = newPasswordHash;
    await this.usersRepository.save(user);

    this.logger.log(`Password reset successfully for ${email}`);
  }

  async confirmEmail(confirmEmailDto: ConfirmEmailDto): Promise<void> {
    const { userId } = confirmEmailDto;

    // Find user by ID
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('Invalid user ID');
    }

    // Check if already confirmed - if so, just return success
    if (user.emailConfirmed) {
      this.logger.log(`Email already confirmed for user ${userId}`);
      return;
    }

    // Mark email as confirmed
    user.emailConfirmed = true;
    await this.usersRepository.save(user);

    this.logger.log(`Email confirmed for user ${userId}`);
  }

  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
