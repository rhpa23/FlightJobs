# FlightJobs Modernization - Backend API Completion Plan

## Overview

This document outlines the plan for completing the NestJS backend API, including all modules, services, controllers, and DTOs required to fully replace the legacy ASP.NET MVC application.

---

## 1. Current State

### 1.1 Implemented Components
| Component | Status | Notes |
|-----------|--------|-------|
| App Module | ⚠️ Basic | Only AppController and AppService |
| Config Module | ✅ Complete | Environment configuration |
| Main Bootstrap | ✅ Complete | CORS, Swagger, ValidationPipe |
| App Service | ⚠️ Basic | Simple health check only |

### 1.2 Missing Components
| Module | Priority | Description |
|--------|----------|-------------|
| Auth Module | Critical | JWT authentication |
| Users Module | Critical | User management |
| Jobs Module | High | Flight job operations |
| Airlines Module | High | Airline management |
| Statistics Module | High | Analytics and leaderboards |
| Challenges Module | Medium | Challenge system |
| Licenses Module | Medium | License management |
| FBO Module | Low | FBO management |
| Airports Module | Low | Airport data service |

---

## 2. Module Implementation Details

### 2.1 Auth Module

#### Files Structure
```
src/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/
│   ├── local.strategy.ts
│   └── jwt.strategy.ts
├── guards/
│   └── jwt-auth.guard.ts
├── decorators/
│   └── current-user.decorator.ts
└── dto/
    ├── login.dto.ts
    └── register.dto.ts
```

#### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/login | User login |
| POST | /auth/register | User registration |
| POST | /auth/refresh | Refresh JWT token |
| POST | /auth/logout | User logout |
| GET | /auth/profile | Get current user profile |
| POST | /auth/forgot-password | Request password reset |
| POST | /auth/reset-password | Reset password with token |
| POST | /auth/confirm-email | Confirm email address |

#### DTOs
```typescript
// login.dto.ts
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

// register.dto.ts
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsString()
  @IsOptional()
  userName: string;
}
```

### 2.2 Users Module

#### Files Structure
```
src/users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
├── entities/
│   └── user.entity.ts
└── dto/
    ├── create-user.dto.ts
    ├── update-user.dto.ts
    └── user-response.dto.ts
```

#### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /users | List all users (admin) |
| GET | /users/:id | Get user by ID |
| PUT | /users/:id | Update user |
| DELETE | /users/:id | Delete user (admin) |
| GET | /users/:id/profile | Get user profile |
| PUT | /users/:id/profile | Update user profile |
| POST | /users/:id/avatar | Upload avatar |

### 2.3 Jobs Module

#### Files Structure
```
src/jobs/
├── jobs.module.ts
├── jobs.controller.ts
├── jobs.service.ts
├── entities/
│   ├── job.entity.ts
│   └── job-status.enum.ts
├── dto/
│   ├── create-job.dto.ts
│   ├── update-job.dto.ts
│   ├── search-jobs.dto.ts
│   ├── generate-jobs.dto.ts
│   └── complete-job.dto.ts
└── services/
    ├── distance-calculator.service.ts
    └── payment-calculator.service.ts
```

#### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /jobs | List all jobs |
| GET | /jobs/:id | Get job by ID |
| POST | /jobs | Create job |
| PUT | /jobs/:id | Update job |
| DELETE | /jobs/:id | Delete job |
| GET | /jobs/search | Search jobs |
| POST | /jobs/generate | Generate jobs |
| POST | /jobs/:id/activate | Activate job |
| POST | /jobs/:id/complete | Complete job |
| GET | /jobs/pending | Get pending jobs |
| GET | /jobs/active | Get active job |
| POST | /jobs/:id/clone | Clone job |

#### DTOs
```typescript
// search-jobs.dto.ts
export class SearchJobsDto {
  @IsOptional()
  @IsString()
  @Length(4, 4)
  departure?: string;

  @IsOptional()
  @IsString()
  @Length(4, 4)
  arrival?: string;

  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(450)
  range?: number;

  @IsOptional()
  @IsNumber()
  aviationType?: number;

  @IsOptional()
  @IsNumber()
  customPlaneCapacityId?: number;
}

// complete-job.dto.ts
export class CompleteJobDto {
  @IsNumber()
  flightTime: number;

  @IsNumber()
  @IsOptional()
  startFuelWeight?: number;

  @IsNumber()
  @IsOptional()
  finishFuelWeight?: number;

  @IsNumber()
  @IsOptional()
  usedFuelWeight?: number;

  @IsString()
  @IsOptional()
  modelName?: string;

  @IsString()
  @IsOptional()
  modelDescription?: string;
}
```

#### Services
```typescript
// distance-calculator.service.ts
@Injectable()
export class DistanceCalculatorService {
  // Haversine formula for distance calculation
  calculateDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number {
    const R = 3440.065; // Earth radius in nautical miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// payment-calculator.service.ts
@Injectable()
export class PaymentCalculatorService {
  calculatePayment(
    distance: number,
    pax: number,
    cargo: number,
    aviationType: number,
    firstClass: number = 0
  ): number {
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
```

### 2.4 Airlines Module

#### Files Structure
```
src/airlines/
├── airlines.module.ts
├── airlines.controller.ts
├── airlines.service.ts
├── entities/
│   ├── airline.entity.ts
│   ├── airline-certificate.entity.ts
│   └── airline-fbo.entity.ts
└── dto/
    ├── create-airline.dto.ts
    ├── update-airline.dto.ts
    ├── join-airline.dto.ts
    └── hire-pilot.dto.ts
```

#### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /airlines | List all airlines |
| GET | /airlines/:id | Get airline details |
| POST | /airlines | Create airline |
| PUT | /airlines/:id | Update airline |
| DELETE | /airlines/:id | Delete airline |
| POST | /airlines/:id/join | Join airline |
| POST | /airlines/:id/leave | Leave airline |
| GET | /airlines/:id/pilots | Get airline pilots |
| POST | /airlines/:id/hire-pilot | Hire pilot |
| POST | /airlines/:id/fire-pilot | Fire pilot |
| GET | /airlines/:id/statistics | Get airline stats |
| GET | /airlines/my-airline | Get user's airline |
| GET | /airlines/:id/ledger | Get airline ledger |
| POST | /airlines/:id/fbo | Hire FBO |
| DELETE | /airlines/:id/fbo/:icao | Release FBO |
| GET | /airlines/:id/fbo | Get airline FBOs |
| POST | /airlines/:id/pay-debt | Pay airline debt |

#### DTOs
```typescript
// create-airline.dto.ts
export class CreateAirlineDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  country: string;

  @IsNumber()
  @Min(0)
  score: number;

  @IsBoolean()
  @IsOptional()
  requireCertificates: boolean;
}
```

### 2.5 Statistics Module

#### Files Structure
```
src/statistics/
├── statistics.module.ts
├── statistics.controller.ts
├── statistics.service.ts
├── entities/
│   ├── statistics.entity.ts
│   └── statistic-certificate.entity.ts
└── dto/
    └── statistics-response.dto.ts
```

#### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /statistics/my-stats | Get current user stats |
| GET | /statistics/:userId | Get user stats |
| GET | /statistics/leaderboard/score | Score leaderboard |
| GET | /statistics/leaderboard/flights | Flights leaderboard |
| GET | /statistics/leaderboard/earnings | Earnings leaderboard |
| GET | /statistics/airline-rankings | Airline rankings |
| GET | /statistics/career-summary/:userId | Career summary |
| GET | /statistics/monthly-stats/:userId | Monthly stats |
| GET | /statistics/airline-stats/:airlineId | Airline stats |
| GET | /statistics/analysis | General analysis |

### 2.6 Challenges Module

#### Files Structure
```
src/challenges/
├── challenges.module.ts
├── challenges.controller.ts
├── challenges.service.ts
├── entities/
│   └── challenge.entity.ts (extends Job)
├── dto/
│   ├── create-challenge.dto.ts
│   └── assign-challenge.dto.ts
└── enums/
    └── challenge-type.enum.ts
```

#### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /challenges | List available challenges |
| GET | /challenges/:id | Get challenge details |
| POST | /challenges | Create challenge |
| POST | /challenges/:id/assign | Assign challenge |
| GET | /challenges/my-challenges | User's challenges |
| DELETE | /challenges/:id | Delete challenge |
| POST | /challenges/:id/briefing | Get challenge briefing |

#### DTOs
```typescript
// create-challenge.dto.ts
export class CreateChallengeDto {
  @IsNumber()
  @Min(1)
  pax: number;

  @IsNumber()
  @Min(0)
  cargo: number;

  @IsNumber()
  @Min(1)
  paxWeight: number;

  @IsString()
  @Length(4, 4)
  departure: string;

  @IsString()
  @Length(4, 4)
  arrival: string;

  @IsEnum(ChallengeType)
  type: ChallengeType;
}

export enum ChallengeType {
  CIVILIAN = 'Civilian',
  MILITARY = 'Military',
  RESCUE = 'Rescue',
}
```

### 2.7 Licenses Module

#### Files Structure
```
src/licenses/
├── licenses.module.ts
├── licenses.controller.ts
├── licenses.service.ts
├── entities/
│   ├── certificate.entity.ts
│   ├── pilot-license-expense.entity.ts
│   ├── pilot-license-item.entity.ts
│   ├── license-item-user.entity.ts
│   └── pilot-license-expenses-user.entity.ts
└── dto/
    └── buy-license.dto.ts
```

#### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /licenses | Get all license types |
| GET | /licenses/:userId | Get user licenses |
| GET | /licenses/:userId/items | Get user license items |
| POST | /licenses/:userId/items/:itemId/buy | Buy license item |
| GET | /licenses/:userId/expenses | Get user license expenses |
| POST | /licenses/:userId/transfer | Transfer funds to airline |

### 2.8 Airports Module

#### Files Structure
```
src/airports/
├── airports.module.ts
├── airports.controller.ts
├── airports.service.ts
├── entities/
│   ├── airport.entity.ts
│   └── runway.entity.ts
└── dto/
    └── airport-search.dto.ts
```

#### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /airports | List airports |
| GET | /airports/search | Search airports |
| GET | /airports/:icao | Get airport by ICAO |
| GET | /airports/:icao/nearby | Get nearby airports |
| GET | /airports/:icao/runways | Get airport runways |

---

## 3. Shared Components

### 3.1 Common Guards
```typescript
// jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

### 3.2 Common Decorators
```typescript
// current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// roles.decorator.ts
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

### 3.3 Common Filters
```typescript
// http-exception.filter.ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
```

### 3.4 Common Interceptors
```typescript
// logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    console.log(`${request.method} ${request.url}`);

    return next.handle().pipe(
      tap(() => console.log(`After... ${Date.now() - now}ms`)),
    );
  }
}
```

### 3.5 Common Pipes
```typescript
// validation.pipe.ts (already configured globally)
// parse-int.pipe.ts
@PipeTransform()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}
```

---

## 4. Database Configuration

### 4.1 TypeORM Configuration (SQLite)
```typescript
// src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: process.env.DATABASE_PATH ||
    path.join(__dirname, '../../../FlightJobs/App_Data/FlightJobsLite.db'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  prepareDatabase: (connection) => {
    connection.prepare('PRAGMA journal_mode = WAL').run();
    connection.prepare('PRAGMA foreign_keys = ON').run();
    connection.prepare('PRAGMA cache_size = -64000').run();
  },
};
```

### 4.2 App Module Update
```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { AirlinesModule } from './airlines/airlines.module';
import { StatisticsModule } from './statistics/statistics.module';
import { ChallengesModule } from './challenges/challenges.module';
import { LicensesModule } from './licenses/licenses.module';
import { AirportsModule } from './airports/airports.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'better-sqlite3',
        database: configService.get('DATABASE_PATH') ||
          path.join(__dirname, '../../FlightJobs/App_Data/FlightJobsLite.db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        prepareDatabase: (connection: any) => {
          connection.prepare('PRAGMA journal_mode = WAL').run();
          connection.prepare('PRAGMA foreign_keys = ON').run();
          connection.prepare('PRAGMA cache_size = -64000').run();
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    JobsModule,
    AirlinesModule,
    StatisticsModule,
    ChallengesModule,
    LicensesModule,
    AirportsModule,
  ],
})
export class AppModule {}
```

---

## 5. Implementation Order

### Phase 1: Foundation (Week 1-2)
1. Auth Module (JWT, Local strategies)
2. Users Module (entity, service, controller)
3. Database configuration
4. Common guards, decorators, filters

### Phase 2: Core Features (Week 3-4)
1. Jobs Module (entity, service, controller)
2. Distance calculator service
3. Payment calculator service
4. Airports Module

### Phase 3: Business Features (Week 5-6)
1. Airlines Module
2. Statistics Module
3. Challenges Module

### Phase 4: Advanced Features (Week 7-8)
1. Licenses Module
2. FBO management
3. Scheduled jobs
4. Email service
5. File upload service

---

## 6. Testing Strategy

### 6.1 Unit Tests
- Test all services
- Test all DTOs validation
- Test utility services

### 6.2 Integration Tests
- Test all controllers
- Test database operations
- Test authentication flow

### 6.3 E2E Tests
- Test complete API flows
- Test error handling
- Test edge cases

---

*Document created: 2026-04-05*
*Last updated: 2026-04-05*
