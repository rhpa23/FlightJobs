import { PartialType } from '@nestjs/swagger';
import { CreateAirlineDto } from './create-airline.dto';

export class UpdateAirlineDto extends PartialType(CreateAirlineDto) {}
