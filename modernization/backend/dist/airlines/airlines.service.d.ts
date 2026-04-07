import { Repository } from 'typeorm';
import { Airline } from './entities/airline.entity';
import { CreateAirlineDto } from './dto/create-airline.dto';
import { UpdateAirlineDto } from './dto/update-airline.dto';
export declare class AirlinesService {
    private airlinesRepository;
    constructor(airlinesRepository: Repository<Airline>);
    findAll(): Promise<Airline[]>;
    findOne(id: number): Promise<Airline>;
    create(createAirlineDto: CreateAirlineDto): Promise<Airline>;
    update(id: number, updateAirlineDto: UpdateAirlineDto): Promise<Airline>;
    remove(id: number): Promise<void>;
}
