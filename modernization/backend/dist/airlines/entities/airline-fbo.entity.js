"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirlineFbo = void 0;
const typeorm_1 = require("typeorm");
const airline_entity_1 = require("./airline.entity");
let AirlineFbo = class AirlineFbo {
};
exports.AirlineFbo = AirlineFbo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'Id' }),
    __metadata("design:type", Number)
], AirlineFbo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Icao', length: 4, nullable: true }),
    __metadata("design:type", String)
], AirlineFbo.prototype, "icao", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => airline_entity_1.Airline),
    (0, typeorm_1.JoinColumn)({ name: 'Airline_Id' }),
    __metadata("design:type", airline_entity_1.Airline)
], AirlineFbo.prototype, "airline", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Availability', default: 0 }),
    __metadata("design:type", Number)
], AirlineFbo.prototype, "availability", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ScoreIncrease', default: 0 }),
    __metadata("design:type", Number)
], AirlineFbo.prototype, "scoreIncrease", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FuelPriceDiscount', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], AirlineFbo.prototype, "fuelPriceDiscount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'GroundCrewDiscount', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], AirlineFbo.prototype, "groundCrewDiscount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Price', default: 0 }),
    __metadata("design:type", Number)
], AirlineFbo.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ContractDate', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], AirlineFbo.prototype, "contractDate", void 0);
exports.AirlineFbo = AirlineFbo = __decorate([
    (0, typeorm_1.Entity)('airlinefbodbmodels')
], AirlineFbo);
//# sourceMappingURL=airline-fbo.entity.js.map