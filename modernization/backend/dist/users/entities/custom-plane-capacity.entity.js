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
exports.CustomPlaneCapacity = void 0;
const typeorm_1 = require("typeorm");
let CustomPlaneCapacity = class CustomPlaneCapacity {
};
exports.CustomPlaneCapacity = CustomPlaneCapacity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CustomPlaneCapacity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], CustomPlaneCapacity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'plane_name' }),
    __metadata("design:type", String)
], CustomPlaneCapacity.prototype, "planeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pax_capacity' }),
    __metadata("design:type", Number)
], CustomPlaneCapacity.prototype, "paxCapacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cargo_capacity' }),
    __metadata("design:type", Number)
], CustomPlaneCapacity.prototype, "cargoCapacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'image_url', nullable: true }),
    __metadata("design:type", String)
], CustomPlaneCapacity.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], CustomPlaneCapacity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], CustomPlaneCapacity.prototype, "updatedAt", void 0);
exports.CustomPlaneCapacity = CustomPlaneCapacity = __decorate([
    (0, typeorm_1.Entity)('custom_plane_capacity')
], CustomPlaneCapacity);
//# sourceMappingURL=custom-plane-capacity.entity.js.map