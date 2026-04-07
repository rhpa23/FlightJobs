import { Airline } from '../../airlines/entities/airline.entity';
import { Job } from '../../jobs/entities/job.entity';
import { AirlineFbo } from '../../airlines/entities/airline-fbo.entity';
export declare class JobAirline {
    id: number;
    airline: Airline;
    job: Job;
    jobDebtValue: number;
    fuelPrice: number;
    fuelCost: number;
    groundCrewCost: number;
    flightCrewCost: number;
    flightAttendantCost: number;
    totalCrewCostLabor: number;
    totalFlightCost: number;
    revenueEarned: number;
    flightIncome: number;
    calcAirlineJob(departureFbo: AirlineFbo | null): void;
    private getFlightTimeHours;
}
