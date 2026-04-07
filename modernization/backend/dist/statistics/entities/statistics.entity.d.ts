import { Airline } from '../../airlines/entities/airline.entity';
import { User } from '../../users/entities/user.entity';
export declare class Statistics {
    id: number;
    user: User;
    bankBalance: number;
    pilotScore: number;
    logo: string;
    sendLicenseWarning: boolean;
    sendAirlineBillsWarning: boolean;
    licenseWarningSent: boolean;
    airlineBillsWarningSent: boolean;
    useCustomPlaneCapacity: boolean;
    weightUnit: string;
    airline: Airline;
    customPlaneCapacityId: number;
    userId: string;
}
