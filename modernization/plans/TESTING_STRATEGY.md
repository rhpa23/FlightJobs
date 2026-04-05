# FlightJobs Modernization - Integration Testing Strategy

## Overview

This document outlines the integration testing strategy for the FlightJobs modernization project, covering backend API testing, frontend integration testing, and end-to-end testing.

---

## 1. Testing Architecture

### 1.1 Testing Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    E2E Tests (Cypress)                       │
│              Full user flow testing                          │
├─────────────────────────────────────────────────────────────┤
│              Frontend Integration Tests                      │
│         Component + Redux + API integration                  │
├─────────────────────────────────────────────────────────────┤
│              Backend Integration Tests                       │
│         Controller + Service + Database                      │
├─────────────────────────────────────────────────────────────┤
│                 Unit Tests                                   │
│         Services, Utilities, DTOs                            │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Testing Tools

| Layer | Tool | Purpose |
|-------|------|---------|
| Backend Unit | Jest | Service and utility testing |
| Backend Integration | Jest + Supertest | API endpoint testing |
| Frontend Unit | Jest + React Testing Library | Component testing |
| Frontend Integration | Jest + MSW | Redux + API integration |
| E2E | Cypress | Full user flow testing |

---

## 2. Backend Integration Testing

### 2.1 Test Setup

```typescript
// test/jest-e2e.json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

### 2.2 Test Database

```typescript
// test/test-database.ts
import { DataSource } from 'typeorm';

export const createTestDataSource = (): DataSource => {
  return new DataSource({
    type: 'better-sqlite3',
    database: ':memory:', // Use in-memory SQLite for tests
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    dropSchema: true,
    synchronize: true,
    logging: false,
  });
};
```

### 2.3 Auth Module Tests

```typescript
// src/auth/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from './auth.module';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createTestDataSource } from '../../test/test-database';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
        TypeOrmModule.forRootAsync({
          useFactory: () => createTestDataSource().options,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should fail with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should fail with weak password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
        })
        .expect(400);
    });

    it('should fail with duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
        })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
    });

    it('should fail with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('GET /auth/profile', () => {
    let authToken: string;

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'profile@example.com',
          password: 'password123',
        });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'profile@example.com',
          password: 'password123',
        });

      authToken = loginResponse.body.access_token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.email).toBe('profile@example.com');
    });

    it('should fail without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });
  });
});
```

### 2.4 Jobs Module Tests

```typescript
// src/jobs/jobs.e2e-spec.ts
describe('JobsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Setup app and authenticate
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    authToken = loginResponse.body.access_token;
    userId = loginResponse.body.user.id;
  });

  describe('POST /jobs', () => {
    it('should create a new job', async () => {
      const response = await request(app.getHttpServer())
        .post('/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          departureICAO: 'SBGR',
          arrivalICAO: 'SBGL',
          pax: 150,
          cargo: 2000,
          aviationType: 2,
        })
        .expect(201);

      expect(response.body.departureICAO).toBe('SBGR');
      expect(response.body.arrivalICAO).toBe('SBGL');
      expect(response.body.pay).toBeGreaterThan(0);
    });
  });

  describe('GET /jobs/search', () => {
    it('should search jobs by departure', async () => {
      const response = await request(app.getHttpServer())
        .get('/jobs/search?departure=SBGR')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /jobs/:id/activate', () => {
    let jobId: number;

    beforeEach(async () => {
      // Create a job first
      const createResponse = await request(app.getHttpServer())
        .post('/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          departureICAO: 'SBGR',
          arrivalICAO: 'SBGL',
          pax: 150,
          cargo: 2000,
        });
      
      jobId = createResponse.body.id;
    });

    it('should activate a job', async () => {
      const response = await request(app.getHttpServer())
        .post(`/jobs/${jobId}/activate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.isActivated).toBe(true);
    });
  });

  describe('GET /jobs/active', () => {
    it('should get active job', async () => {
      const response = await request(app.getHttpServer())
        .get('/jobs/active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (response.body) {
        expect(response.body.isActivated).toBe(true);
      }
    });
  });
});
```

### 2.5 Airlines Module Tests

```typescript
// src/airlines/airlines.e2e-spec.ts
describe('AirlinesController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  describe('POST /airlines', () => {
    it('should create a new airline', async () => {
      const response = await request(app.getHttpServer())
        .post('/airlines')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Airlines',
          country: 'Brazil',
          score: 100,
          requireCertificates: false,
        })
        .expect(201);

      expect(response.body.name).toBe('Test Airlines');
    });

    it('should fail with duplicate name', async () => {
      await request(app.getHttpServer())
        .post('/airlines')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Existing Airlines',
          country: 'Brazil',
          score: 100,
        });

      await request(app.getHttpServer())
        .post('/airlines')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Existing Airlines',
          country: 'USA',
          score: 100,
        })
        .expect(409);
    });
  });

  describe('POST /airlines/:id/join', () => {
    it('should join an airline', async () => {
      // Create airline first
      const airlineResponse = await request(app.getHttpServer())
        .post('/airlines')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Join Test Airlines',
          country: 'Brazil',
          score: 0,
        });

      const airlineId = airlineResponse.body.id;

      const response = await request(app.getHttpServer())
        .post(`/airlines/${airlineId}/join`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.airline.id).toBe(airlineId);
    });
  });
});
```

---

## 3. Frontend Integration Testing

### 3.1 Test Setup

```typescript
// src/test-utils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { BrowserRouter } from 'react-router-dom';

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### 3.2 Auth Slice Tests

```typescript
// src/store/slices/authSlice.test.ts
import authReducer, { login, logout } from './authSlice';
import { authApi } from '../../services/api';

jest.mock('../../services/api');

describe('authSlice', () => {
  const mockAuthApi = authApi as jest.Mocked<typeof authApi>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
  });

  it('should handle login.fulfilled', async () => {
    const mockResponse = {
      access_token: 'test-token',
      user: { id: '1', email: 'test@example.com' },
    };

    mockAuthApi.login.mockResolvedValueOnce(mockResponse);

    const store = configureStore({
      reducer: { auth: authReducer },
    });

    await store.dispatch(login({ email: 'test@example.com', password: 'password' }));

    const state = store.getState().auth;
    expect(state.token).toBe('test-token');
    expect(state.user?.email).toBe('test@example.com');
  });

  it('should handle login.rejected', async () => {
    mockAuthApi.login.mockRejectedValueOnce(new Error('Invalid credentials'));

    const store = configureStore({
      reducer: { auth: authReducer },
    });

    await store.dispatch(login({ email: 'test@example.com', password: 'wrong' }));

    const state = store.getState().auth;
    expect(state.error).toContain('Invalid credentials');
  });
});
```

### 3.3 Component Integration Tests

```typescript
// src/pages/Login.test.tsx
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from './Login';
import { render } from '../test-utils';
import { authApi } from '../services/api';

jest.mock('../services/api');

describe('Login Page', () => {
  it('should render login form', () => {
    render(<Login />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(<Login />);
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('should login successfully', async () => {
    const mockResponse = {
      access_token: 'test-token',
      user: { id: '1', email: 'test@example.com' },
    };

    (authApi.login as jest.Mock).mockResolvedValueOnce(mockResponse);

    render(<Login />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
```

### 3.4 Dashboard Integration Test

```typescript
// src/pages/Dashboard.test.tsx
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { render } from '../test-utils';
import { statisticsApi, jobsApi, airlinesApi } from '../services/api';

jest.mock('../services/api');

describe('Dashboard Page', () => {
  beforeEach(() => {
    (statisticsApi.getMyStats as jest.Mock).mockResolvedValue({
      bankBalance: 10000,
      pilotScore: 500,
      numberFlights: 50,
      flightTimeTotal: '25h 30m',
    });

    (jobsApi.getPendingJobs as jest.Mock).mockResolvedValue([]);
    (jobsApi.getActiveJob as jest.Mock).mockResolvedValue(null);
    (airlinesApi.getMyAirline as jest.Mock).mockResolvedValue(null);
  });

  it('should display statistics', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/10,000/i)).toBeInTheDocument();
      expect(screen.getByText(/500/i)).toBeInTheDocument();
      expect(screen.getByText(/50/i)).toBeInTheDocument();
    });
  });
});
```

---

## 4. E2E Testing with Cypress

### 4.1 Test Setup

```typescript
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
  },
});
```

### 4.2 Authentication Flow

```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should login with valid credentials', () => {
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.get('header').should('contain', 'test@example.com');
  });

  it('should show error with invalid credentials', () => {
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.get('[data-testid="error-message"]').should('be.visible');
  });

  it('should navigate to register page', () => {
    cy.get('a').contains('create a new account').click();
    cy.url().should('include', '/register');
  });
});
```

### 4.3 Job Search Flow

```typescript
// cypress/e2e/jobs.cy.ts
describe('Job Search Flow', () => {
  beforeEach(() => {
    cy.login(); // Custom command
    cy.visit('/search');
  });

  it('should display search form', () => {
    cy.get('input[name="departure"]').should('be.visible');
    cy.get('input[name="arrival"]').should('be.visible');
    cy.get('input[type="range"]').should('be.visible');
  });

  it('should search for jobs', () => {
    cy.get('input[name="departure"]').type('SBGR');
    cy.get('input[name="arrival"]').type('SBGL');
    cy.get('button[type="submit"]').click();

    cy.get('[data-testid="search-results"]').should('be.visible');
  });

  it('should select and confirm job', () => {
    // Search first
    cy.get('input[name="departure"]').type('SBGR');
    cy.get('input[name="arrival"]').type('SBGL');
    cy.get('button[type="submit"]').click();

    // Select job
    cy.get('[data-testid="job-row"]').first().click();
    cy.get('button').contains('Confirm').click();

    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="pending-jobs"]').should('be.visible');
  });
});
```

### 4.4 Airline Management Flow

```typescript
// cypress/e2e/airlines.cy.ts
describe('Airline Management Flow', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/airlines');
  });

  it('should display airlines list', () => {
    cy.get('[data-testid="airline-card"]').should('have.length.greaterThan', 0);
  });

  it('should create a new airline', () => {
    cy.get('button').contains('Create Airline').click();
    
    cy.get('input[name="name"]').type('Test Airlines');
    cy.get('input[name="country"]').type('Brazil');
    cy.get('input[name="score"]').type('100');
    cy.get('button[type="submit"]').click();

    cy.get('[data-testid="toast"]').should('contain', 'Airline created');
  });
});
```

---

## 5. Test Coverage Requirements

### 5.1 Coverage Targets

| Component | Target |
|-----------|--------|
| Backend Services | 80% |
| Backend Controllers | 70% |
| Frontend Components | 70% |
| Redux Slices | 80% |
| E2E Critical Paths | 100% |

### 5.2 Critical Paths for E2E

1. **Authentication**
   - Register → Login → Dashboard → Logout
   - Password reset flow
   - Token refresh

2. **Job Management**
   - Search jobs → Select job → Confirm → Activate → Complete
   - Delete job
   - Clone job

3. **Airline Management**
   - Create airline → Edit airline → Join airline → Leave airline
   - Hire/fire pilot
   - FBO management

4. **Profile Management**
   - Update profile
   - Upload avatar
   - Buy license
   - Transfer funds

---

## 6. CI/CD Integration

### 6.1 GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: password
          POSTGRES_DB: flightjobs_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install backend dependencies
        run: cd modernization/backend && npm ci
      
      - name: Run backend tests
        run: cd modernization/backend && npm test
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USERNAME: postgres
          DB_PASSWORD: password
          DB_DATABASE: flightjobs_test

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install frontend dependencies
        run: cd modernization/frontend && npm ci
      
      - name: Run frontend tests
        run: cd modernization/frontend && npm test

  e2e-test:
    runs-on: ubuntu-latest
    needs: [backend-test, frontend-test]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd modernization/backend && npm ci
          cd ../frontend && npm ci
      
      - name: Start backend
        run: cd modernization/backend && npm run start:prod &
      
      - name: Start frontend
        run: cd modernization/frontend && npm start &
      
      - name: Run E2E tests
        run: cd modernization/frontend && npx cypress run
```

---

## 7. Test Data Management

### 7.1 Test Fixtures

```typescript
// test/fixtures/users.ts
export const testUsers = {
  admin: {
    email: 'admin@flightjobs.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
  },
  pilot: {
    email: 'pilot@flightjobs.com',
    password: 'pilot123',
    firstName: 'John',
    lastName: 'Pilot',
  },
  airlineOwner: {
    email: 'owner@flightjobs.com',
    password: 'owner123',
    firstName: 'Jane',
    lastName: 'Owner',
  },
};
```

### 7.2 Database Seeding for Tests

```typescript
// test/seed-test-data.ts
export async function seedTestData(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const statisticsRepository = dataSource.getRepository(Statistics);

  for (const userData of Object.values(testUsers)) {
    const user = userRepository.create({
      ...userData,
      passwordHash: await bcrypt.hash(userData.password, 10),
      emailConfirmed: true,
    });
    await userRepository.save(user);

    const stats = statisticsRepository.create({
      user,
      bankBalance: 100000,
      pilotScore: 1000,
    });
    await statisticsRepository.save(stats);
  }
}
```

---

*Document created: 2026-04-05*
*Last updated: 2026-04-05*
