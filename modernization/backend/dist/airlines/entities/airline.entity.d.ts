import { User } from '../../users/entities/user.entity';
export declare class Airline {
    id: number;
    name: string;
    description: string;
    country: string;
    salary: number;
    score: number;
    logo: string;
    bankBalance: number;
    airlineScore: number;
    userId: string;
    debtValue: number;
    debtMaturityDate: Date;
    owner: User;
}
