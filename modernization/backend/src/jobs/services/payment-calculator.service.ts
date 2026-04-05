import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentCalculatorService {
  calculatePayment(distance: number, pax: number, cargo: number, aviationType: number, firstClass: number = 0): number {
    const baseRate = 0.5; // per NM
    const paxRate = 0.1;
    const cargoRate = 0.05;
    const aviationMultiplier = this.getAviationMultiplier(aviationType);
    const firstClassBonus = firstClass * 0.2;

    return Math.round(
      (distance * baseRate + pax * paxRate + cargo * cargoRate) *
        aviationMultiplier *
        (1 + firstClassBonus)
    );
  }

  private getAviationMultiplier(type: number): number {
    switch (type) {
      case 1: return 1.0;  // General aviation
      case 2: return 1.2;  // Air transport
      case 3: return 1.5;  // Heavy
      case 4: return 1.3;  // Cargo
      default: return 1.0;
    }
  }
}
