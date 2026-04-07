import { User } from '../../users/entities/user.entity';
export declare class PilotLicenseExpenseUser {
    id: number;
    user: User;
    maturityDate: Date;
    overdueProcessed: boolean;
}
