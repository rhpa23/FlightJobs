# FlightJobs Modernization - Database Strategy (SQLite)

## Overview

This document outlines the database strategy for the FlightJobs modernization project, using the existing SQLite database (`FlightJobs/App_Data/FlightJobsLite.db`) as the primary data store. No migration to PostgreSQL is required.

---

## 1. Database Architecture

### 1.1 Database Files

| Database | Type | Location | Purpose |
|----------|------|----------|---------|
| FlightJobsLite.db | SQLite | `../FlightJobs/App_Data/FlightJobsLite.db` | Main application data (users, jobs, airlines, statistics, etc.) |
| navdata.sqlite | SQLite | `../FlightJobs.Domain.Navdata/navdata.sqlite` | Airport and runway data |

### 1.2 Advantages of Using SQLite

- **No migration needed**: Reuse existing data directly
- **Simpler deployment**: No external database server required
- **Portable**: Database is a single file
- **Sufficient for current scale**: The legacy app works well with SQLite
- **Lower infrastructure cost**: No PostgreSQL server to maintain

### 1.3 Considerations

- **Concurrency**: SQLite handles concurrent reads well, but writes are serialized
- **Scalability**: If needed in the future, can migrate to PostgreSQL
- **Backup**: Simple file copy backup strategy
- **Connection pooling**: Not needed for SQLite, but connection management is still important

---

## 2. TypeORM Configuration for SQLite

### 2.1 Database Configuration

```typescript
// src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: path.join(__dirname, '../../../FlightJobs/App_Data/FlightJobsLite.db'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Set to true only for development
  logging: process.env.NODE_ENV === 'development',
  // SQLite-specific options
  prepareDatabase: (connection) => {
    // Enable WAL mode for better concurrent access
    connection.prepare('PRAGMA journal_mode = WAL').run();
    // Enable foreign keys
    connection.prepare('PRAGMA foreign_keys = ON').run();
    // Increase cache size
    connection.prepare('PRAGMA cache_size = -64000').run();
  },
};
```

### 2.2 Required Dependencies

```bash
npm install @nestjs/typeorm typeorm better-sqlite3
npm install -D @types/better-sqlite3
```

### 2.3 App Module Configuration

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
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
    // ... other modules
  ],
})
export class AppModule {}
```

---

## 3. Entity Mapping (SQLite Compatible)

### 3.1 Primary Key Considerations

SQLite uses INTEGER PRIMARY KEY for auto-increment. TypeORM handles this automatically with `@PrimaryGeneratedColumn()`.

### 3.2 User Entity

```typescript
// Legacy: AspNetUsers table (ASP.NET Identity)
// Note: Users may need to be migrated from ASP.NET Identity format

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'user_name', nullable: true })
  userName: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ name: 'email_confirmed', default: 0 })
  emailConfirmed: boolean;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ name: 'lockout_enabled', default: 1 })
  lockoutEnabled: boolean;

  @Column({ name: 'lockout_end', nullable: true, type: 'datetime' })
  lockoutEnd: Date;

  @Column({ name: 'access_failed_count', default: 0 })
  accessFailedCount: number;

  @OneToOne(() => Statistics, statistics => statistics.user)
  statistics: Statistics;

  @OneToMany(() => Job, job => job.user)
  jobs: Job[];

  @OneToOne(() => Airline, airline => airline.owner)
  ownedAirline: Airline;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
```

### 3.3 Statistics Entity

```typescript
// Legacy: Statistics table
@Entity('statistics')
export class Statistics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'bank_balance', default: 0 })
  bankBalance: number;

  @Column({ name: 'pilot_score', default: 0 })
  pilotScore: number;

  @Column({ name: 'number_flights', default: 0 })
  numberFlights: number;

  @Column({ name: 'flight_time_total', type: 'decimal', precision: 10, scale: 2, default: 0 })
  flightTimeTotal: number;

  @Column({ name: 'payload_total', type: 'decimal', precision: 10, scale: 2, default: 0 })
  payloadTotal: number;

  @Column({ name: 'last_flight', type: 'datetime', nullable: true })
  lastFlight: Date;

  @Column({ name: 'last_aircraft', nullable: true })
  lastAircraft: string;

  @Column({ name: 'favorite_airplane', nullable: true })
  favoriteAirplane: string;

  @Column({ name: 'weight_unit', default: 'kg' })
  weightUnit: string;

  @Column({ name: 'license_warning_sent', default: 0 })
  licenseWarningSent: boolean;

  @Column({ name: 'send_license_warning', default: 1 })
  sendLicenseWarning: boolean;

  @Column({ name: 'airline_bills_warning_sent', default: 0 })
  airlineBillsWarningSent: boolean;

  @Column({ name: 'send_airline_bills_warning', default: 1 })
  sendAirlineBillsWarning: boolean;

  @Column({ name: 'logo', nullable: true })
  logo: string;

  @OneToOne(() => User, user => user.statistics)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Airline, airline => airline.pilots, { nullable: true })
  @JoinColumn({ name: 'airline_id' })
  airline: Airline;

  @OneToOne(() => CustomPlaneCapacity, { nullable: true })
  @JoinColumn({ name: 'custom_plane_capacity_id' })
  customPlaneCapacity: CustomPlaneCapacity;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
```

### 3.4 Job Entity

```typescript
// Legacy: JobDbModels table
@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'departure_icao', length: 4 })
  departureICAO: string;

  @Column({ name: 'arrival_icao', length: 4 })
  arrivalICAO: string;

  @Column({ name: 'alternative_icao', length: 4, nullable: true })
  alternativeICAO: string;

  @Column({ default: 0 })
  distance: number;

  @Column({ default: 0 })
  pax: number;

  @Column({ default: 0 })
  cargo: number;

  @Column({ default: 0 })
  pay: number;

  @Column({ name: 'first_class', default: 0 })
  firstClass: number;

  @Column({ name: 'is_done', default: 0 })
  isDone: boolean;

  @Column({ name: 'is_activated', default: 0 })
  isActivated: boolean;

  @Column({ name: 'in_progress', default: 0 })
  inProgress: boolean;

  @Column({ name: 'is_challenge', default: 0 })
  isChallenge: boolean;

  @Column({ name: 'challenge_type', nullable: true })
  challengeType: string;

  @Column({ name: 'challenge_creator_user_id', nullable: true })
  challengeCreatorUserId: string;

  @Column({ name: 'challenge_expiration_date', type: 'datetime', nullable: true })
  challengeExpirationDate: Date;

  @Column({ name: 'start_time', type: 'datetime', nullable: true })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime', nullable: true })
  endTime: Date;

  @Column({ name: 'model_name', nullable: true })
  modelName: string;

  @Column({ name: 'model_description', nullable: true })
  modelDescription: string;

  @Column({ name: 'aviation_type', default: 1 })
  aviationType: number;

  @Column({ name: 'start_fuel_weight', nullable: true })
  startFuelWeight: number;

  @Column({ name: 'finish_fuel_weight', nullable: true })
  finishFuelWeight: number;

  @Column({ name: 'used_fuel_weight', nullable: true })
  usedFuelWeight: number;

  @Column({ name: 'weight_unit', nullable: true })
  weightUnit: string;

  @Column({ name: 'payload', nullable: true })
  payload: number;

  @Column({ name: 'payload_pax', nullable: true })
  payloadPax: number;

  @Column({ name: 'pax_weight', default: 84 })
  paxWeight: number;

  @Column({ name: 'video_url', nullable: true })
  videoUrl: string;

  @Column({ name: 'video_description', nullable: true })
  videoDescription: string;

  @Column({ name: 'payload_display', nullable: true })
  payloadDisplay: string;

  @ManyToOne(() => User, user => user.jobs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Airline, airline => airline.jobs, { nullable: true })
  @JoinColumn({ name: 'airline_id' })
  airline: Airline;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
```

### 3.5 Airline Entity

```typescript
// Legacy: Airlines table
@Entity('airlines')
export class Airline {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  country: string;

  @Column({ default: 20 })
  salary: number;

  @Column({ default: 0 })
  score: number;

  @Column({ name: 'airline_score', default: 0 })
  airlineScore: number;

  @Column({ nullable: true })
  logo: string;

  @Column({ name: 'bank_balance', default: 0 })
  bankBalance: number;

  @Column({ name: 'debt_value', default: 0 })
  debtValue: number;

  @Column({ name: 'debt_maturity_date', type: 'datetime', nullable: true })
  debtMaturityDate: Date;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  owner: User;

  @OneToMany(() => Statistics, statistics => statistics.airline)
  pilots: Statistics[];

  @OneToMany(() => Job, job => job.airline)
  jobs: Job[];

  @OneToMany(() => AirlineCertificate, cert => cert.airline)
  certificates: AirlineCertificate[];

  @OneToMany(() => AirlineFbo, fbo => fbo.airline)
  fbos: AirlineFbo[];

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
```

---

## 4. Database Schema Analysis

### 4.1 Existing Tables in FlightJobsLite.db

Based on the legacy code analysis, the following tables exist:

| Table | Description |
|-------|-------------|
| AspNetUsers | ASP.NET Identity users |
| AspNetRoles | ASP.NET Identity roles |
| AspNetUserRoles | User-role mapping |
| AspNetUserClaims | User claims |
| AspNetUserLogins | User login providers |
| JobDbModels | Flight jobs |
| Airlines | Virtual airlines |
| Statistics | Pilot statistics |
| Certificates | Pilot certificates |
| AirlineCertificates | Airline required certificates |
| StatisticCertificates | User owned certificates |
| CustomPlaneCapacity | Custom aircraft configurations |
| AirlineFbo | Airline FBO contracts |
| JobAirline | Airline job records |
| PilotLicenseExpenses | License expense types |
| PilotLicenseExpensesUser | User license expenses |
| PilotLicenseItems | License items |
| LicenseItemUser | User license items |

### 4.2 Schema Discovery

To understand the exact schema, run:

```bash
# Using sqlite3 CLI
sqlite3 FlightJobs/App_Data/FlightJobsLite.db ".tables"
sqlite3 FlightJobs/App_Data/FlightJobsLite.db ".schema"
```

---

## 5. Implementation Strategy

### 5.1 Phase 1: Database Connection

1. Install SQLite dependencies:
   ```bash
   cd modernization/backend
   npm install better-sqlite3 @nestjs/typeorm typeorm
   npm install -D @types/better-sqlite3
   ```

2. Configure TypeORM for SQLite in `app.module.ts`

3. Test connection to existing database

### 5.2 Phase 2: Entity Mapping

1. Analyze existing database schema
2. Create TypeORM entities matching existing tables
3. Use `synchronize: true` temporarily for development
4. Test entity relationships

### 5.3 Phase 3: User Migration

Since ASP.NET Identity uses a different password hashing format, we need to:

1. Create a migration script to convert ASP.NET Identity users to our new format
2. Or, implement a dual authentication strategy that supports both formats during transition

### 5.4 Phase 4: Navdata Integration

1. Connect to navdata.sqlite for airport data
2. Create Airport and Runway entities
3. Create airport search service

---

## 6. Environment Variables

```env
# Database Configuration
DATABASE_PATH=../FlightJobs/App_Data/FlightJobsLite.db
NAVDATA_DB_PATH=../FlightJobs.Domain.Navdata/navdata.sqlite

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

---

## 7. Backup Strategy

### 7.1 SQLite Backup

Since SQLite is a file-based database, backup is simple:

```bash
#!/bin/bash
# Backup script
cp FlightJobs/App_Data/FlightJobsLite.db backups/FlightJobsLite_$(date +%Y%m%d_%H%M%S).db

# Optional: Vacuum before backup for smaller file
sqlite3 FlightJobs/App_Data/FlightJobsLite.db "VACUUM;"
```

### 7.2 Restore

```bash
#!/bin/bash
# Restore script
cp backups/FlightJobsLite_YYYYMMDD_HHMMSS.db FlightJobs/App_Data/FlightJobsLite.db
```

---

## 8. Performance Optimization

### 8.1 PRAGMA Settings

```typescript
prepareDatabase: (connection) => {
  // Write-Ahead Logging for better concurrent access
  connection.prepare('PRAGMA journal_mode = WAL').run();
  // Enable foreign key constraints
  connection.prepare('PRAGMA foreign_keys = ON').run();
  // Increase page cache (64MB)
  connection.prepare('PRAGMA cache_size = -64000').run();
  // Increase busy timeout
  connection.prepare('PRAGMA busy_timeout = 5000').run();
  // Enable memory-mapped I/O (256MB)
  connection.prepare('PRAGMA mmap_size = 268435456').run();
}
```

### 8.2 Indexes

Ensure indexes exist on frequently queried columns:

```sql
-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Jobs
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_done ON jobs(is_done);
CREATE INDEX IF NOT EXISTS idx_jobs_is_activated ON jobs(is_activated);
CREATE INDEX IF NOT EXISTS idx_jobs_departure_icao ON jobs(departure_icao);
CREATE INDEX IF NOT EXISTS idx_jobs_arrival_icao ON jobs(arrival_icao);

-- Statistics
CREATE INDEX IF NOT EXISTS idx_statistics_user_id ON statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_statistics_pilot_score ON statistics(pilot_score);

-- Airlines
CREATE INDEX IF NOT EXISTS idx_airlines_name ON airlines(name);
```

---

## 9. Testing Considerations

### 9.1 Test Database

For testing, use a separate in-memory or file-based SQLite database:

```typescript
// test/test-database.ts
import { DataSource } from 'typeorm';

export const createTestDataSource = (): DataSource => {
  return new DataSource({
    type: 'better-sqlite3',
    database: ':memory:', // Or use a test file
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    dropSchema: true,
    synchronize: true,
    logging: false,
  });
};
```

---

*Document created: 2026-04-05*
*Last updated: 2026-04-05*
