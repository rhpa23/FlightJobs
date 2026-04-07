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
exports.Airline = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let Airline = class Airline {
};
exports.Airline = Airline;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'Id' }),
    __metadata("design:type", Number)
], Airline.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Name', nullable: true }),
    __metadata("design:type", String)
], Airline.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', nullable: true }),
    __metadata("design:type", String)
], Airline.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Country', nullable: true }),
    __metadata("design:type", String)
], Airline.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Salary', default: 20 }),
    __metadata("design:type", Number)
], Airline.prototype, "salary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Score', default: 0 }),
    __metadata("design:type", Number)
], Airline.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Logo', nullable: true }),
    __metadata("design:type", String)
], Airline.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BankBalance', default: 0 }),
    __metadata("design:type", Number)
], Airline.prototype, "bankBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AirlineScore', default: 0 }),
    __metadata("design:type", Number)
], Airline.prototype, "airlineScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'UserId', nullable: true }),
    __metadata("design:type", String)
], Airline.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DebtValue', default: 0 }),
    __metadata("design:type", Number)
], Airline.prototype, "debtValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DebtMaturityDate', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Airline.prototype, "debtMaturityDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'UserId' }),
    __metadata("design:type", user_entity_1.User)
], Airline.prototype, "owner", void 0);
exports.Airline = Airline = __decorate([
    (0, typeorm_1.Entity)('airlinedbmodels')
], Airline);
//# sourceMappingURL=airline.entity.js.map