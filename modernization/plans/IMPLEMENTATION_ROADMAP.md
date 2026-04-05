# FlightJobs Modernization - Implementation Roadmap

## Overview

This roadmap outlines the phased approach to modernizing the FlightJobs application from ASP.NET MVC to NestJS + React. Each phase builds upon the previous one, ensuring a stable foundation before adding complex features.

---

## Phase 1: Foundation & Authentication

**Goal**: Establish the core infrastructure and authentication system.

### 1.1 Backend Setup

#### Database Configuration
- [ ] Configure TypeORM with SQLite (better-sqlite3)
- [ ] Connect to existing FlightJobsLite.db database
- [ ] Create database configuration module
- [ ] Enable WAL mode and optimize PRAGMA settings
- [ ] Create seed data scripts for new tables

#### Core Entities
- [ ] `User` entity (replacing ApplicationUser)
- [ ] `Statistics` entity
- [ ] Base entity with common fields (createdAt, updatedAt)
- [ ] Entity relationships setup

#### Authentication Module
- [ ] JWT strategy implementation
- [ ] Local strategy for login
- [ ] Password hashing with bcrypt
- [ ] JWT guards
- [ ] Auth controller with endpoints:
  - `POST /auth/login`
  - `POST /auth/register`
  - `POST /auth/refresh`
  - `POST /auth/logout`
  - `GET /auth/profile`

#### Users Module
- [ ] Users service
- [ ] Users controller
- [ ] User DTOs (CreateUserDto, UpdateUserDto)
- [ ] User validation

### 1.2 Frontend Setup

#### Configuration
- [ ] Install and configure Tailwind CSS
- [ ] Set up design system (colors, typography, spacing)
- [ ] Configure environment variables
- [ ] Set up ESLint and Prettier

#### Layout Components
- [ ] Header component with user info
- [ ] Sidebar navigation
- [ ] Footer component
- [ ] Layout wrapper

#### Authentication Pages
- [ ] Complete Login page integration
- [ ] Register page with validation
- [ ] Protected route component
- [ ] Auth redirect logic

### 1.3 Integration
- [ ] Connect frontend to backend auth
- [ ] Token management in localStorage
- [ ] Axios interceptors for auth
- [ ] Error handling for auth failures

**Deliverables**:
- Working authentication flow
- User can register, login, and access protected routes
- Basic layout with navigation

---

## Phase 2: Core Job Management

**Goal**: Implement the flight job system - the core feature of the application.

### 2.1 Backend - Job Module

#### Entities
- [ ] `Job` entity with all fields from legacy JobDbModel
- [ ] Job relationships (User, Airline)
- [ ] Job status enum (pending, active, completed)

#### Services
- [ ] Jobs service with CRUD operations
- [ ] Job search service
- [ ] Job generation service
- [ ] Distance calculation service (Haversine formula)
- [ ] Payment calculation service

#### Controllers
- [ ] Jobs controller with endpoints:
  - `GET /jobs` - List all jobs
  - `GET /jobs/:id` - Get job details
  - `POST /jobs` - Create job
  - `PUT /jobs/:id` - Update job
  - `DELETE /jobs/:id` - Delete job
  - `GET /jobs/search` - Search jobs
  - `POST /jobs/generate` - Generate jobs
  - `POST /jobs/:id/activate` - Activate job
  - `POST /jobs/:id/complete` - Complete job
  - `GET /jobs/pending` - Get pending jobs
  - `GET /jobs/active` - Get active job

#### DTOs
- [ ] CreateJobDto
- [ ] UpdateJobDto
- [ ] SearchJobsDto
- [ ] GenerateJobsDto
- [ ] CompleteJobDto

### 2.2 Frontend - Job Pages

#### Search Jobs Page
- [ ] Search form (origin, destination, range)
- [ ] Aviation type filter
- [ ] Custom plane capacity selector
- [ ] Search results table
- [ ] Alternative airport suggestions
- [ ] Arrival airport tips
- [ ] Job selection and confirmation

#### Dashboard Integration
- [ ] Fetch and display current job
- [ ] Fetch and display pending jobs
- [ ] Job activation from dashboard
- [ ] Job deletion from dashboard

### 2.3 Airport Data
- [ ] Connect to existing navdata.sqlite for airport data
- [ ] Airport entity and service
- [ ] Airport search endpoint
- [ ] Distance calculation between airports

**Deliverables**:
- Users can search for flights
- Users can generate and accept jobs
- Dashboard shows current and pending jobs

---

## Phase 3: Statistics & Dashboard

**Goal**: Complete the statistics system and enhance the dashboard.

### 3.1 Backend - Statistics Module

#### Entities
- [ ] `Statistics` entity (if not created in Phase 1)
- [ ] Statistics relationships

#### Services
- [ ] Statistics calculation service
- [ ] Leaderboard service
- [ ] Career summary service
- [ ] Monthly statistics service

#### Controllers
- [ ] Statistics controller with endpoints:
  - `GET /statistics/my-stats` - Current user stats
  - `GET /statistics/:userId` - User stats
  - `GET /statistics/leaderboard/score` - Score leaderboard
  - `GET /statistics/leaderboard/flights` - Flights leaderboard
  - `GET /statistics/leaderboard/earnings` - Earnings leaderboard
  - `GET /statistics/airline-rankings` - Airline rankings
  - `GET /statistics/career-summary/:userId` - Career summary
  - `GET /statistics/monthly-stats/:userId` - Monthly stats

### 3.2 Frontend - Enhanced Dashboard

#### Dashboard Enhancements
- [ ] Loading states for all data
- [ ] Error boundaries
- [ ] Statistics cards with real data
- [ ] Current job details
- [ ] Pending jobs list with actions
- [ ] Airline info section
- [ ] Weight unit toggle

#### Leaderboards Page
- [ ] Score leaderboard
- [ ] Flights leaderboard
- [ ] Earnings leaderboard
- [ ] Airline rankings

**Deliverables**:
- Complete dashboard with real data
- Leaderboards and rankings
- Statistics display

---

## Phase 4: Airline Management

**Goal**: Implement the virtual airline system.

### 4.1 Backend - Airline Module

#### Entities
- [ ] `Airline` entity
- [ ] `AirlineCertificate` entity
- [ ] `StatisticCertificate` entity
- [ ] `AirlineFbo` entity
- [ ] `JobAirline` entity
- [ ] Airline relationships

#### Services
- [ ] Airlines service with CRUD
- [ ] Certificate management service
- [ ] FBO management service
- [ ] Pilot hiring/firing service
- [ ] Airline ledger service

#### Controllers
- [ ] Airlines controller with endpoints:
  - `GET /airlines` - List all airlines
  - `GET /airlines/:id` - Get airline details
  - `POST /airlines` - Create airline
  - `PUT /airlines/:id` - Update airline
  - `DELETE /airlines/:id` - Delete airline
  - `POST /airlines/:id/join` - Join airline
  - `POST /airlines/:id/leave` - Leave airline
  - `GET /airlines/:id/pilots` - Get airline pilots
  - `POST /airlines/:id/hire-pilot` - Hire pilot
  - `POST /airlines/:id/fire-pilot` - Fire pilot
  - `GET /airlines/:id/statistics` - Get airline stats
  - `GET /airlines/my-airline` - Get user's airline
  - `GET /airlines/:id/ledger` - Get airline ledger
  - `POST /airlines/:id/fbo` - Hire FBO
  - `DELETE /airlines/:id/fbo/:icao` - Release FBO

#### DTOs
- [ ] CreateAirlineDto
- [ ] UpdateAirlineDto
- [ ] JoinAirlineDto
- [ ] HirePilotDto
- [ ] FboDto

### 4.2 Frontend - Airline Pages

#### Airlines Page
- [ ] Airlines list
- [ ] Airline details
- [ ] Create airline form
- [ ] Edit airline form
- [ ] Certificate management
- [ ] Pilot list

#### Airline Ledger Page
- [ ] Ledger table
- [ ] Filter by departure/arrival
- [ ] Pagination
- [ ] FBO management

**Deliverables**:
- Users can create and manage airlines
- Certificate system for contracts
- FBO hiring and management
- Airline ledger

---

## Phase 5: Pilot Profile & License System

**Goal**: Complete the pilot profile with flight logbook and license management.

### 5.1 Backend - Profile Module

#### Entities
- [ ] `Certificate` entity
- [ ] `PilotLicenseExpense` entity
- [ ] `PilotLicenseItem` entity
- [ ] `LicenseItemUser` entity
- [ ] `PilotLicenseExpensesUser` entity
- [ ] `CustomPlaneCapacity` entity

#### Services
- [ ] Profile service
- [ ] License management service
- [ ] Custom plane capacity service
- [ ] Flight logbook service

#### Controllers
- [ ] Profile controller with endpoints:
  - `GET /profile/:userId` - Get user profile
  - `GET /profile/:userId/logbook` - Get flight logbook
  - `GET /profile/:userId/licenses` - Get licenses
  - `POST /profile/:userId/licenses/buy` - Buy license item
  - `GET /profile/:userId/capacity` - Get custom capacities
  - `POST /profile/:userId/capacity` - Create capacity
  - `PUT /profile/:userId/capacity/:id` - Update capacity
  - `DELETE /profile/:userId/capacity/:id` - Delete capacity
  - `POST /profile/:userId/transfer` - Transfer funds
  - `POST /profile/avatar` - Upload avatar

### 5.2 Frontend - Profile Page

#### Profile Page
- [ ] Pilot info display
- [ ] Flight logbook table
- [ ] Logbook filtering and sorting
- [ ] License management
- [ ] Custom plane capacity management
- [ ] Fund transfer
- [ ] Avatar upload

**Deliverables**:
- Complete pilot profile
- Flight logbook with filtering
- License management system
- Custom aircraft configurations

---

## Phase 6: Challenge System

**Goal**: Implement the challenge system for special missions.

### 6.1 Backend - Challenge Module

#### Entities
- [ ] Extend `Job` entity with challenge fields
- [ ] Challenge type enum

#### Services
- [ ] Challenge service
- [ ] Challenge generation service
- [ ] Challenge assignment service

#### Controllers
- [ ] Challenges controller with endpoints:
  - `GET /challenges` - List available challenges
  - `GET /challenges/:id` - Get challenge details
  - `POST /challenges` - Create challenge
  - `POST /challenges/:id/assign` - Assign challenge
  - `GET /challenges/my-challenges` - User's challenges
  - `DELETE /challenges/:id` - Delete challenge

#### DTOs
- [ ] CreateChallengeDto
- [ ] AssignChallengeDto

### 6.2 Frontend - Challenge Pages

#### Challenge Page
- [ ] Available challenges list
- [ ] Challenge creation form
- [ ] Challenge briefing display
- [ ] Challenge assignment
- [ ] My challenges section

**Deliverables**:
- Challenge creation and management
- Challenge assignment system
- Challenge briefing display

---

## Phase 7: Advanced Features & Polish

**Goal**: Add remaining features and polish the application.

### 7.1 Backend - Additional Features

#### Scheduled Jobs
- [ ] Set up @nestjs/schedule
- [ ] License expiration email job
- [ ] Database backup job
- [ ] Challenge expiration job

#### Integrations
- [ ] SimBrief API integration
- [ ] Email service setup
- [ ] File upload service (avatars, logos)

#### Analysis Endpoints
- [ ] Model ranking
- [ ] Aviation type ranking
- [ ] Departure/destination ranking
- [ ] General statistics

### 7.2 Frontend - Additional Pages

#### Analysis Page
- [ ] General statistics
- [ ] Model ranking charts
- [ ] Aviation type charts
- [ ] Departure/destination rankings

#### Settings Page
- [ ] Email notification preferences
- [ ] Weight unit preference
- [ ] Account settings

#### Video Sharing
- [ ] Job video URL input
- [ ] Video embed display

### 7.3 UI Polish
- [ ] Loading spinners
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Confirmation dialogs
- [ ] Responsive design testing
- [ ] Accessibility improvements

**Deliverables**:
- All remaining features implemented
- Scheduled jobs running
- Polished UI/UX
- Responsive design

---

## Phase 8: Testing & Deployment

**Goal**: Ensure quality and deploy to production.

### 8.1 Testing

#### Backend Tests
- [ ] Unit tests for services
- [ ] Unit tests for controllers
- [ ] Integration tests for API endpoints
- [ ] E2E tests

#### Frontend Tests
- [ ] Unit tests for components
- [ ] Unit tests for Redux slices
- [ ] Integration tests for pages
- [ ] E2E tests with Cypress

### 8.2 Documentation
- [ ] API documentation (Swagger)
- [ ] Setup instructions
- [ ] Deployment guide
- [ ] Contributing guide

### 8.3 Deployment
- [ ] Set up CI/CD pipeline
- [ ] Configure production environment
- [ ] Database migration scripts
- [ ] Production build optimization
- [ ] Monitoring and logging

**Deliverables**:
- Comprehensive test coverage
- Complete documentation
- Production deployment
- Monitoring setup

---

## Architecture Diagram

```mermaid
flowchart TB
    subgraph Frontend[React Frontend]
        UI[UI Components]
        Store[Redux Store]
        API[API Service]
        Router[React Router]
    end
    
    subgraph Backend[NestJS Backend]
        Auth[Auth Module]
        Users[Users Module]
        Jobs[Jobs Module]
        Airlines[Airlines Module]
        Stats[Statistics Module]
        Challenges[Challenges Module]
        Profile[Profile Module]
    end
    
    subgraph Database[(SQLite Databases)]
        UsersDB[Users]
        JobsDB[Jobs]
        AirlinesDB[Airlines]
        StatsDB[Statistics]
        CertsDB[Certificates]
        NavdataDB[(navdata.sqlite)]
    end
    
    subgraph External[External Services]
        SimBrief[SimBrief API]
        Email[Email Service]
        Storage[File Storage]
    end
    
    UI --> Store
    Store --> API
    API --> Router
    API --> Auth
    API --> Users
    API --> Jobs
    API --> Airlines
    API --> Stats
    API --> Challenges
    API --> Profile
    
    Auth --> UsersDB
    Users --> UsersDB
    Jobs --> JobsDB
    Airlines --> AirlinesDB
    Stats --> StatsDB
    Challenges --> JobsDB
    Profile --> CertsDB
    
    Jobs --> SimBrief
    Auth --> Email
    Profile --> Storage
```

---

## Timeline Overview

| Phase | Description | Priority |
|-------|-------------|----------|
| Phase 1 | Foundation & Authentication | Critical |
| Phase 2 | Core Job Management | High |
| Phase 3 | Statistics & Dashboard | High |
| Phase 4 | Airline Management | Medium |
| Phase 5 | Pilot Profile & License | Medium |
| Phase 6 | Challenge System | Medium |
| Phase 7 | Advanced Features & Polish | Low |
| Phase 8 | Testing & Deployment | Low |

---

## Success Criteria

- [ ] All legacy features implemented
- [ ] API compatibility with legacy endpoints
- [ ] Responsive and accessible UI
- [ ] Comprehensive test coverage
- [ ] Production deployment successful
- [ ] Documentation complete
- [ ] Performance meets or exceeds legacy application

---

*Document created: 2026-04-05*
*Last updated: 2026-04-05*
