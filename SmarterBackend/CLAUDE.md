# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start server**: `npm start` or `./start-server.sh`
- **Development mode**: `npm run dev`
- **Build**: `npm run build` (generates Prisma client)
- **Database migration**: `npm run migrate` (for production deployments)
- **Database operations**: Use Prisma CLI commands like `npx prisma migrate dev`, `npx prisma generate`, `npx prisma studio`

The `start-server.sh` script automatically kills any existing processes on port 3000 before starting the server.

## Deployment

### Render.com Deployment
- The app includes a `build` script that generates the Prisma client
- `postinstall` script ensures Prisma client is generated after dependency installation
- Use `npm run migrate` in production to apply database migrations
- Ensure `DATABASE_URL` environment variable is set in Render

### Build Process
1. Dependencies are installed (`npm install`)
2. `postinstall` automatically runs `npx prisma generate`
3. If using a build command, `npm run build` also generates the Prisma client
4. Server starts with `npm start`

## Architecture Overview

This is a Node.js Express backend for a financial transaction tracking application with the following key architectural patterns:

### Database Layer
- **Prisma ORM** with PostgreSQL database
- Custom Prisma client output location: `./generated/prisma`
- Three main entities: User, Card, Transaction
- Users can have multiple cards, cards have multiple transactions

### Application Architecture
- **Repository Pattern**: `ISimpleRepository` interface with `SimpleRepository` implementation
- **Controller Pattern**: Base controller (`BaseController`) with standardized response methods
- **Service Layer**: Data processing services like `DataReader`

### Key Components

**Controllers** (`/controllers/`):
- `BaseController.js` - Provides common response methods, pagination, validation
- `UserController.js` - User management endpoints
- `V2UserController.js` - Enhanced user API with additional features
- `TransactionController.js` - Transaction data endpoints
- `CardController.js` - Card management endpoints

**Repository Layer** (`/repositories/`):
- `ISimpleRepository.js` - Interface defining all database operations
- `SimpleRepository.js` - Prisma-based implementation

**Models** (`/models/`):
- Domain model definitions and data transfer objects

**Services** (`/services/`):
- `DataReader.js` - CSV/data import functionality

### Authentication
- JWT-based authentication with `authenticateToken` middleware
- Bcrypt for password hashing
- JWT secret configurable via `JWT_SECRET` environment variable

### API Documentation
- Swagger/OpenAPI documentation with Scalar API reference UI
- CORS enabled for all origins in development

### Environment Configuration
- PostgreSQL connection via `DATABASE_URL`
- Server port configurable via `PORT` (default: 3000 in package.json, 8000 in server.js)
- Environment-specific error handling (detailed errors in development)

## Data Import
The application supports CSV transaction data import through the `DataReader` service and transaction import endpoints.