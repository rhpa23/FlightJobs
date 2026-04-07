"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var NavdataService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavdataService = void 0;
const common_1 = require("@nestjs/common");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path = __importStar(require("path"));
let NavdataService = NavdataService_1 = class NavdataService {
    constructor() {
        this.logger = new common_1.Logger(NavdataService_1.name);
    }
    onModuleInit() {
        const dbPath = process.env.NAVDATA_DB_PATH || path.join(__dirname, '../../../../FlightJobs.Domain.Navdata/navdata.sqlite');
        this.logger.log(`Inicializando conexão com navdata: ${dbPath}`);
        this.db = new better_sqlite3_1.default(dbPath, { readonly: true });
    }
    onModuleDestroy() {
        if (this.db) {
            this.db.close();
        }
    }
    getCloseAirport(latitude, longitude) {
        const latDownOffset = latitude - 2;
        const latUpOffset = latitude + 2;
        const lonDownOffset = longitude - 2;
        const lonUpOffset = longitude + 2;
        const minDistance = 15000;
        const query = `
      SELECT * FROM airport 
      WHERE laty > ? AND laty < ? AND lonx > ? AND lonx < ?
    `;
        try {
            const rows = this.db.prepare(query).all(latDownOffset, latUpOffset, lonDownOffset, lonUpOffset);
            if (!rows || rows.length === 0) {
                return null;
            }
            const airportsWithDistance = rows
                .filter((row) => row.num_runways > 0)
                .map((row) => ({
                airport: this.mapRowToAirport(row),
                distance: this.haversineDistance(latitude, longitude, row.laty, row.lonx)
            }))
                .filter(item => item.distance < minDistance)
                .sort((a, b) => a.distance - b.distance);
            return airportsWithDistance.length > 0 ? airportsWithDistance[0].airport : null;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar aeroporto próximo: ${error.message}`);
            return null;
        }
    }
    getAirportByIcao(icao) {
        const query = `SELECT * FROM airport WHERE UPPER(ident) = ?`;
        try {
            const row = this.db.prepare(query).get(icao.toUpperCase());
            return row ? this.mapRowToAirport(row) : null;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar aeroporto por ICAO: ${error.message}`);
            return null;
        }
    }
    mapRowToAirport(row) {
        return {
            airportId: row.airport_id,
            ident: row.ident,
            name: row.name,
            city: row.city,
            state: row.state,
            hasAvgas: row.has_avgas,
            hasJetfuel: row.has_jetfuel,
            isMilitary: row.is_military,
            longestRunwayLength: row.longest_runway_length,
            longestRunwayWidth: row.longest_runway_width,
            longestRunwayHeading: row.longest_runway_heading,
            longestRunwaySurface: row.longest_runway_surface,
            numRunways: row.num_runways,
            magVar: row.mag_var,
            altitude: row.altitude,
            lonx: row.lonx,
            laty: row.laty
        };
    }
    haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
};
exports.NavdataService = NavdataService;
exports.NavdataService = NavdataService = NavdataService_1 = __decorate([
    (0, common_1.Injectable)()
], NavdataService);
//# sourceMappingURL=navdata.service.js.map