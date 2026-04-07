import { AirlinesService } from './airlines.service';
import { CreateAirlineDto } from './dto/create-airline.dto';
import { UpdateAirlineDto } from './dto/update-airline.dto';
export declare class AirlinesController {
    private readonly airlinesService;
    constructor(airlinesService: AirlinesService);
    findAll(): Promise<import("./entities/airline.entity").Airline[]>;
    findMyAirline(req: any): Promise<import("./entities/airline.entity").Airline[]>;
    findOne(id: number): Promise<import("./entities/airline.entity").Airline>;
    create(createAirlineDto: CreateAirlineDto): Promise<import("./entities/airline.entity").Airline>;
    update(id: number, updateAirlineDto: UpdateAirlineDto): Promise<import("./entities/airline.entity").Airline>;
    remove(id: number): Promise<void>;
    joinAirline(id: number): {
        message: string;
    };
    leaveAirline(id: number): {
        message: string;
    };
}
