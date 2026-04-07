import { Job } from '../../jobs/entities/job.entity';
import { Airline } from '../../airlines/entities/airline.entity';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    userName: string;
    securityStamp: string;
    phoneNumber: string;
    phoneNumberConfirmed: boolean;
    twoFactorEnabled: boolean;
    lockoutEnd: Date;
    lockoutEnabled: boolean;
    accessFailedCount: number;
    emailConfirmed: boolean;
    jobs: Job[];
    airlines: Airline[];
}
