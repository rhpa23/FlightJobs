# FlightJobs Modernization

A complete modernization of the FlightJobs web application using modern technologies.

## Architecture

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **UI**: Tailwind CSS
- **Charts**: Chart.js
- **Maps**: Leaflet

## Features

### Core Functionality
- ✅ User authentication (login/register)
- ✅ Dashboard with pilot statistics
- ✅ Job search and management
- ✅ Airline management
- ✅ Pilot profile with logbook
- ✅ Real-time updates
- ✅ Responsive design

### Modern Improvements
- 🎨 Modern UI/UX with Tailwind CSS
- 📱 Mobile-responsive design
- ⚡ Improved performance
- 🔒 Enhanced security
- 📊 Interactive charts and maps
- 🔄 Real-time updates

## Project Structure

```
modernization/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/            # Authentication module
│   │   ├── users/           # User management
│   │   ├── jobs/            # Flight jobs
│   │   ├── airlines/        # Airline management
│   │   ├── statistics/      # Pilot statistics
│   │   └── common/          # Shared utilities
│   └── package.json
└── frontend/                # React application
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── pages/          # Page components
    │   ├── store/          # Redux store
    │   └── services/       # API services
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd modernization/backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database configuration
```

4. Start the development server:
```bash
npm run start:dev
```

API will be available at: http://localhost:3001
API Documentation: http://localhost:3001/api/docs

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd modernization/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

Application will be available at: http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job
- `PATCH /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Airlines
- `GET /api/airlines` - Get all airlines
- `POST /api/airlines` - Create new airline
- `POST /api/airlines/:id/join` - Join airline

## Database Schema

### Users
- id (UUID)
- email (string)
- password (hashed)
- firstName, lastName
- avatar (optional)

### Jobs
- id (integer)
- departureICAO, arrivalICAO
- distance, pax, cargo, pay
- timestamps
- user relationship

### Airlines
- id (integer)
- name, description, country
- score, salary, bankBalance
- owner relationship

### Statistics
- id (integer)
- bankBalance, pilotScore
- numberFlights, flightTimeTotal
- user relationship

## Development

### Running Tests
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

### Building for Production
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

## Migration from Original

The modernized application maintains API compatibility with the original FlightJobs desktop application while providing:

1. **Enhanced Security**: JWT authentication, input validation
2. **Better Performance**: Optimized queries, caching
3. **Modern UI**: Responsive design, better UX
4. **Scalability**: Microservices-ready architecture
5. **Maintainability**: Clean code, proper documentation

## Future Enhancements

- [ ] Real-time flight tracking
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-tenant support
- [ ] Internationalization
- [ ] Advanced reporting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
