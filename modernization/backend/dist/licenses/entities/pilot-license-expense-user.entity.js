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
exports.PilotLicenseExpenseUser = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let PilotLicenseExpenseUser = class PilotLicenseExpenseUser {
};
exports.PilotLicenseExpenseUser = PilotLicenseExpenseUser;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'Id' }),
    __metadata("design:type", Number)
], PilotLicenseExpenseUser.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'User_Id' }),
    __metadata("design:type", user_entity_1.User)
], PilotLicenseExpenseUser.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'MaturityDate', type: 'datetime' }),
    __metadata("design:type", Date)
], PilotLicenseExpenseUser.prototype, "maturityDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'OverdueProcessed', default: false }),
    __metadata("design:type", Boolean)
], PilotLicenseExpenseUser.prototype, "overdueProcessed", void 0);
exports.PilotLicenseExpenseUser = PilotLicenseExpenseUser = __decorate([
    (0, typeorm_1.Entity)('pilotlicenseexpensesuserdbmodels')
], PilotLicenseExpenseUser);
//# sourceMappingURL=pilot-license-expense-user.entity.js.map