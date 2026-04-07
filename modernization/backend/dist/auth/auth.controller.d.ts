import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    refresh(req: any): Promise<{
        message: string;
        user: any;
    }>;
    logout(): Promise<{
        message: string;
    }>;
    getProfile(req: any): Promise<{
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
}
