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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const user_entity_1 = require("../users/entities/user.entity");
const statistics_entity_1 = require("../statistics/entities/statistics.entity");
const password_util_1 = require("../utils/password.util");
let AuthService = class AuthService {
    constructor(usersRepository, statisticsRepository, jwtService) {
        this.usersRepository = usersRepository;
        this.statisticsRepository = statisticsRepository;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (user && (0, password_util_1.verifyAspNetPassword)(password, user.passwordHash)) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                userName: user.userName,
            },
        };
    }
    async register(registerDto) {
        const existingUser = await this.usersRepository.findOne({ where: { email: registerDto.email } });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        const passwordHash = (0, password_util_1.hashAspNetPassword)(registerDto.password);
        const newId = this.generateGuid();
        const newUser = this.usersRepository.create({
            id: newId,
            email: registerDto.email,
            passwordHash,
            userName: registerDto.userName || registerDto.email,
            emailConfirmed: true,
            lockoutEnabled: true,
        });
        const savedUser = await this.usersRepository.save(newUser);
        const stats = this.statisticsRepository.create({
            userId: savedUser.id,
            bankBalance: 0,
            pilotScore: 0,
        });
        await this.statisticsRepository.save(stats);
        const payload = { email: savedUser.email, sub: savedUser.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: savedUser.id,
                email: savedUser.email,
                userName: savedUser.userName,
            },
        };
    }
    async getProfile(userId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const { passwordHash, ...result } = user;
        return result;
    }
    generateGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(statistics_entity_1.Statistics)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map