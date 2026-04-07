import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Airport } from './entities/airport.entity';
export declare class NavdataService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private db;
    onModuleInit(): void;
    onModuleDestroy(): void;
    getCloseAirport(latitude: number, longitude: number): Airport | null;
    getAirportByIcao(icao: string): Airport | null;
    private mapRowToAirport;
    private haversineDistance;
    private toRadians;
}
