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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirlinesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const airlines_service_1 = require("./airlines.service");
const create_airline_dto_1 = require("./dto/create-airline.dto");
const update_airline_dto_1 = require("./dto/update-airline.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let AirlinesController = class AirlinesController {
    constructor(airlinesService) {
        this.airlinesService = airlinesService;
    }
    findAll() {
        return this.airlinesService.findAll();
    }
    findMyAirline(req) {
        return this.airlinesService.findAll();
    }
    findOne(id) {
        return this.airlinesService.findOne(id);
    }
    create(createAirlineDto) {
        return this.airlinesService.create(createAirlineDto);
    }
    update(id, updateAirlineDto) {
        return this.airlinesService.update(id, updateAirlineDto);
    }
    remove(id) {
        return this.airlinesService.remove(id);
    }
    joinAirline(id) {
        return { message: `Joined airline ${id}` };
    }
    leaveAirline(id) {
        return { message: `Left airline ${id}` };
    }
};
exports.AirlinesController = AirlinesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all airlines' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AirlinesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-airline'),
    (0, swagger_1.ApiOperation)({ summary: "Get user's airline" }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AirlinesController.prototype, "findMyAirline", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get airline details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AirlinesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create airline' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_airline_dto_1.CreateAirlineDto]),
    __metadata("design:returntype", void 0)
], AirlinesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update airline' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_airline_dto_1.UpdateAirlineDto]),
    __metadata("design:returntype", void 0)
], AirlinesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete airline' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AirlinesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    (0, swagger_1.ApiOperation)({ summary: 'Join airline' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AirlinesController.prototype, "joinAirline", null);
__decorate([
    (0, common_1.Post)(':id/leave'),
    (0, swagger_1.ApiOperation)({ summary: 'Leave airline' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AirlinesController.prototype, "leaveAirline", null);
exports.AirlinesController = AirlinesController = __decorate([
    (0, swagger_1.ApiTags)('airlines'),
    (0, common_1.Controller)('airlines'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [airlines_service_1.AirlinesService])
], AirlinesController);
//# sourceMappingURL=airlines.controller.js.map