import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { Statistics } from '../statistics/entities/statistics.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { verifyAspNetPassword, hashAspNetPassword } from '../utils/password.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Statistics)
    private statisticsRepository: Repository<Statistics>,
    private jwtService: JwtService,
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
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        avatar: user.avatar,
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
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      userName: registerDto.userName || registerDto.email,
      emailConfirmed: true,
      lockoutEnabled: true,
    });

    const savedUser = await this.usersRepository.save(newUser);

    // Create statistics record
    const stats = this.statisticsRepository.create({
      user: savedUser,
      bankBalance: 0,
      pilotScore: 0,
      numberFlights: 0,
      flightTimeTotal: 0,
      payloadTotal: 0,
    });
    await this.statisticsRepository.save(stats);

    const payload = { email: savedUser.email, sub: savedUser.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        userName: savedUser.userName,
        avatar: savedUser.avatar,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['statistics'],
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const { passwordHash, ...result } = user;
    return result;
  }

  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
