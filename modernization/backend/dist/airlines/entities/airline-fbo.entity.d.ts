import { Airline } from './airline.entity';
export declare class AirlineFbo {
    id: number;
    icao: string;
    airline: Airline;
    availability: number;
    scoreIncrease: number;
    fuelPriceDiscount: number;
    groundCrewDiscount: number;
    price: number;
    contractDate: Date;
}
