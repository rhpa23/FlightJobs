import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Airline } from './entities/airline.entity';
import { CreateAirlineDto } from './dto/create-airline.dto';
import { UpdateAirlineDto } from './dto/update-airline.dto';

@Injectable()
export class AirlinesService {
  constructor(
    @InjectRepository(Airline)
    private airlinesRepository: Repository<Airline>,
  ) {}

  async findAll(): Promise<Airline[]> {
    return this.airlinesRepository.find();
  }

  async findOne(id: number): Promise<Airline> {
    const airline = await this.airlinesRepository.findOne({ where: { id } });
    if (!airline) {
      throw new NotFoundException(`Airline with ID ${id} not found`);
    }
    return airline;
  }

  async create(createAirlineDto: CreateAirlineDto): Promise<Airline> {
    const airline = this.airlinesRepository.create(createAirlineDto);
    return this.airlinesRepository.save(airline);
  }

  async update(id: number, updateAirlineDto: UpdateAirlineDto): Promise<Airline> {
    const airline = await this.findOne(id);
    Object.assign(airline, updateAirlineDto);
    return this.airlinesRepository.save(airline);
  }

  async remove(id: number): Promise<void> {
    const airline = await this.findOne(id);
    await this.airlinesRepository.remove(airline);
  }
}
