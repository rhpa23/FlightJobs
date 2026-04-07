import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { Statistics } from '../statistics/entities/statistics.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private usersRepository;
    private statisticsRepository;
    private jwtService;
    constructor(usersRepository: Repository<User>, statisticsRepository: Repository<Statistics>, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            userName: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            userName: string;
        };
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        userName: string;
        securityStamp: string;
        phoneNumber: string;
        phoneNumberConfirmed: boolean;
        twoFactorEnabled: boolean;
        lockoutEnd: Date;
        lockoutEnabled: boolean;
        accessFailedCount: number;
        emailConfirmed: boolean;
        jobs: import("../jobs/entities/job.entity").Job[];
        airlines: import("../airlines/entities/airline.entity").Airline[];
    }>;
    private generateGuid;
}
