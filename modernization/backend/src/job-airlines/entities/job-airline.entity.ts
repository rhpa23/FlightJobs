import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Airline } from '../../airlines/entities/airline.entity';
import { Job } from '../../jobs/entities/job.entity';
import { AirlineFbo } from '../../airlines/entities/airline-fbo.entity';

@Entity('jobairlinedbmodels')
export class JobAirline {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @ManyToOne(() => Airline)
  @JoinColumn({ name: 'Airline_Id' })
  airline: Airline;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'Job_Id' })
  job: Job;

  @Column({ name: 'JobDebtValue', default: 0 })
  jobDebtValue: number;

  // Campos calculados (persistidos para histórico)
  //@Column({ name: 'FuelPrice', type: 'float', default: 0 })
  fuelPrice: number;

  //@Column({ name: 'FuelCost', type: 'float', default: 0 })
  fuelCost: number;

  //@Column({ name: 'GroundCrewCost', type: 'float', default: 0 })
  groundCrewCost: number;

  //@Column({ name: 'FlightCrewCost', type: 'float', default: 0 })
  flightCrewCost: number;

  //@Column({ name: 'FlightAttendantCost', type: 'float', default: 0 })
  flightAttendantCost: number;

  //@Column({ name: 'TotalCrewCostLabor', type: 'float', default: 0 })
  totalCrewCostLabor: number;

  //@Column({ name: 'TotalFlightCost', type: 'float', default: 0 })
  totalFlightCost: number;

  //@Column({ name: 'RevenueEarned', type: 'float', default: 0 })
  revenueEarned: number;

  //@Column({ name: 'FlightIncome', type: 'float', default: 0 })
  flightIncome: number;

  /**
   * Calcula os valores do job da airline baseado no FBO de partida
   * Equivalente ao CalcAirlineJob do legado
   */
  calcAirlineJob(departureFbo: AirlineFbo | null): void {
    // FuelPrice = AviationType > 1 ? 5.20 : 5.70
    this.fuelPrice = this.job.aviationType > 1 ? 5.20 : 5.70;

    // FlightCrewCost = JobPay + (JobPay * 0.8)
    this.flightCrewCost = this.job.pay + (this.job.pay * 0.8);

    // GroundCrewCost = FlightCrewCost * 0.3
    this.groundCrewCost = this.flightCrewCost * 0.3;

    let grCrewDiscount = 0.0;
    let fuelCostWithoutDiscount = 0.0;

    if (departureFbo) {
      fuelCostWithoutDiscount = (this.job.startFuelWeight - this.job.finishFuelWeight) * this.fuelPrice;

      const fuelDiscount = this.fuelPrice * departureFbo.fuelPriceDiscount;
      this.fuelPrice -= fuelDiscount;

      grCrewDiscount = this.groundCrewCost * departureFbo.groundCrewDiscount;
      this.groundCrewCost -= grCrewDiscount;
    }

    // FuelCost = (StartFuelWeight - FinishFuelWeight) * FuelPrice
    this.fuelCost = (this.job.startFuelWeight - this.job.finishFuelWeight) * this.fuelPrice;

    // FuelCostPerNM = FuelCost / Dist (não persistido, mas calculável)

    // FlightAttendantCost = (Pax / 60) * (21 * FlightTimeHours)
    const flightTimeHours = this.getFlightTimeHours();
    this.flightAttendantCost = (this.job.pax / 60) * (21 * flightTimeHours);

    // TotalCrewCostLabor = FlightCrewCost + FlightAttendantCost
    this.totalCrewCostLabor = this.flightCrewCost + this.flightAttendantCost;

    // TotalFlightCost = TotalCrewCostLabor + FuelCost + GroundCrewCost
    this.totalFlightCost = this.totalCrewCostLabor + this.fuelCost + this.groundCrewCost;

    // RevenueEarned = TotalFlightCost * 1.35
    this.revenueEarned = this.totalFlightCost * 1.35;
    if (departureFbo) {
      this.revenueEarned += grCrewDiscount;
      this.revenueEarned += (fuelCostWithoutDiscount - this.fuelCost);
    }

    // FlightIncome = RevenueEarned - TotalFlightCost
    this.flightIncome = this.revenueEarned - this.totalFlightCost;
  }

  private getFlightTimeHours(): number {
    if (!this.job.startTime || !this.job.endTime) {
      return 0;
    }
    const diffMs = new Date(this.job.endTime).getTime() - new Date(this.job.startTime).getTime();
    return diffMs / (1000 * 60 * 60);
  }
}
