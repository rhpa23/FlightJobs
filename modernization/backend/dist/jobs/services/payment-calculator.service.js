"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentCalculatorService = void 0;
const common_1 = require("@nestjs/common");
let PaymentCalculatorService = class PaymentCalculatorService {
    calculatePayment(distance, pax, cargo, aviationType, firstClass = 0) {
        const baseRate = 0.5;
        const paxRate = 0.1;
        const cargoRate = 0.05;
        const aviationMultiplier = this.getAviationMultiplier(aviationType);
        const firstClassBonus = firstClass * 0.2;
        return Math.round((distance * baseRate + pax * paxRate + cargo * cargoRate) *
            aviationMultiplier *
            (1 + firstClassBonus));
    }
    getAviationMultiplier(type) {
        switch (type) {
            case 1: return 1.0;
            case 2: return 1.2;
            case 3: return 1.5;
            case 4: return 1.3;
            default: return 1.0;
        }
    }
};
exports.PaymentCalculatorService = PaymentCalculatorService;
exports.PaymentCalculatorService = PaymentCalculatorService = __decorate([
    (0, common_1.Injectable)()
], PaymentCalculatorService);
//# sourceMappingURL=payment-calculator.service.js.map