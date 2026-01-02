# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sundey CRM is a NestJS-based CRM backend system built with **Hybrid Clean Architecture** and **Hexagonal Architecture (Ports & Adapters)** patterns. The system uses Fastify, PostgreSQL with Prisma ORM, Redis, BullMQ for background jobs, and JWT-based authentication.

## Development Commands

### Essential Commands
- **Development**: `pnpm run dev` - Run with tsx watch mode (hot reload, 한글 로깅 포함)
- **Build**: `pnpm run build` - Production build with tsup (minified)
- **Start**: `pnpm run start` - Run production build (requires .env file)
- **Lint**: `pnpm run lint` - Run ESLint with auto-fix
- **Format**: `pnpm run format` - Format code with Prettier
- **Test**: `pnpm run test` - Run Jest tests
- **Test (watch)**: `pnpm run test:watch` - Run tests in watch mode
- **Test (coverage)**: `pnpm run test:cov` - Generate coverage report
- **Test (debug)**: `pnpm run test:debug` - Run tests with debugger

### Prisma Commands
- **Generate Client**: `npx prisma generate` - Generate Prisma client after schema changes
- **Create Migration**: `npx prisma migrate dev --name <migration_name>` - Create and apply migration
- **Apply Migration**: `npx prisma migrate deploy` - Apply migrations in production
- **Prisma Studio**: `npx prisma studio` - Open database GUI

### Docker Commands
- **Start all services**: `docker-compose up -d` - Start API, PostgreSQL, Redis, Worker, Nginx
- **View logs**: `docker-compose logs -f api` - Follow API logs
- **Stop services**: `docker-compose down` - Stop all containers
- **Clean up**: `docker-compose down -v` - Stop and remove volumes

## Architecture

### Layer Structure

All domain modules follow this structure:
```
modules/<domain>/
 ├─ domain/            → Pure business logic (entities, domain services)
 ├─ application/       → Use cases (orchestrates business flows)
 ├─ infrastructure/    → Adapters (Prisma, Queue, Redis implementations)
 ├─ interface/         → Controllers, DTOs, ViewModels
 └─ <domain>.module.ts → Module definition with DI configuration
```

### Dependency Rules

**Critical**: The dependency flow is strictly unidirectional:
- `interface` → `application` → `domain`
- `domain` layer MUST NOT depend on NestJS, Prisma, or any framework
- `infrastructure` implements ports (interfaces) defined in `src/core/ports/`
- All repositories use the Port → Adapter pattern

### Port & Adapter Pattern

1. **Port Declaration**: All repository interfaces are defined in `src/core/ports/*.port.ts`
2. **Adapter Implementation**: Concrete implementations are in `modules/<domain>/infrastructure/*-adapter.ts`
3. **Dependency Injection**: Modules bind ports to adapters using tokens from `src/core/ports/tokens.ts`

Example from `users.module.ts`:
```typescript
{
  provide: USER_REPOSITORY,     // Port token
  useClass: PrismaUserAdapter,  // Adapter implementation
}
```

### Path Aliases

The project uses TypeScript path aliases (configured in `tsconfig.json`):
- `@/*` → `src/*`
- `@common/*` → `src/common/*`
- `@core/*` → `src/core/*`
- `@modules/*` → `src/modules/*`
- `@configs/*` → `src/configs/*`

Always use these aliases instead of relative paths.

### Use Case Pattern

All use cases implement `IUseCase<TInput, TOutput>` from `src/core/base.usecase.ts`:
- Each use case has a single `execute()` method
- Use cases inject repository ports via constructor (using DI tokens)
- DTOs are transformed to domain entities in the interface layer
- Use cases return plain objects or domain entities

## Domain Logic

### Key Business Rules

**Reservation State Machine**:
```
PENDING_INQUIRY → CONFIRMED → WORKING → DONE
                ↓             ↓
            CANCELLED     CANCELLED
```

- `PENDING_INQUIRY`: Initial inquiry state, no customer yet
- `CONFIRMED`: Reservation confirmed - **automatically creates customer** if not exists (by phone)
- `WORKING`: Service in progress
- `DONE`: Service completed
- `CANCELLED`: Cancelled at any stage
- `NO_SHOW`: Customer didn't show up

**Customer Auto-Creation**: When a reservation is confirmed, the system:
1. Searches for existing customer by phone + companyId
2. If not found, automatically creates customer record
3. Links reservation to customer via `customerId`

**Payment Tracking**:
- Reservations support partial payments (`paidAmount` vs `totalPrice`)
- `isPaid` flag indicates full payment
- Unpaid reservations can be queried per company for accounts receivable

### Authentication & Authorization

- **Global JWT Guard**: All endpoints require authentication by default (applied via `APP_GUARD` in `app.module.ts`)
- **Public endpoints**: Use `@Public()` decorator to skip authentication
- **Role-based access**: Use `@Roles()` decorator with RolesGuard (roles: `OWNER`, `MANAGER`, `STAFF`)
- **JWT Strategy**: Configured in `auth/infrastructure/jwt.strategy.ts`

### Multi-tenancy

- All data is scoped by `companyId`
- Users belong to a single company
- When creating resources, always verify user has access to the company

## Infrastructure

### Database
- **ORM**: Prisma 5.22
- **Schema**: `prisma/schema.prisma` defines all models
- **Unique constraints**: Customer uses `@@unique([phone, companyId])`
- **Cascading deletes**: All company-related data cascades on company deletion

### Logging
- **Library**: Pino (Fast structured JSON logging)
- **Integration**: `@nestjs/pino` for NestJS integration
- **Configuration**: `src/configs/logger.config.ts` - Environment-based configuration
- **Log Levels**:
  - `DEBUG` (Level 20) - Development environment (default)
  - `INFO` (Level 30) - Production environment (default)
  - Includes: `trace`, `debug`, `info`, `warn`, `error`, `fatal`
- **Korean Messages**: All log messages are written in Korean for clarity
- **Usage Pattern**: Inject `PinoLogger` and call `logger.setContext(ClassName.name)`

### Queue System
- **BullMQ**: Background job processing (configured in `modules/queue/`)
- **Redis**: Required for BullMQ
- **Queue Adapter**: `modules/queue/infrastructure/bullmq.adapter.ts` implements queue port

### Build System
- **tsup**: ESM-only bundling with esbuild
- **External dependencies**: All framework dependencies are externalized (not bundled)
- **Tree shaking disabled**: Prevents NestJS module removal issues

## Environment Variables

Required environment variables (see `.env.example`):
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`, `JWT_EXPIRES_IN`: Access token config
- `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`: Refresh token config
- `REDIS_HOST`, `REDIS_PORT`: Redis connection
- `BULL_QUEUE_NAME`: BullMQ queue identifier
- `PORT`: API server port (default: 3000)
- `CORS_ORIGIN`: Allowed CORS origin

## API Documentation

Swagger documentation is auto-generated and available at `/api` when the server is running.
- JWT Bearer authentication is configured in Swagger UI
- All endpoints are documented with DTOs and response types

## Common Patterns

### Creating a New Domain Module

1. Create module structure: `domain/`, `application/`, `infrastructure/`, `interface/`
2. Define domain entity in `domain/<entity>.entity.ts`
3. Define repository port in `src/core/ports/<entity>.repository.port.ts`
4. Add DI token in `src/core/ports/tokens.ts`
5. Implement Prisma adapter in `infrastructure/prisma-<entity>.adapter.ts`
6. Create mapper in `infrastructure/<entity>.mapper.ts` (Prisma model ↔ domain entity)
7. Create use cases in `application/`
8. Create DTOs in `interface/dto/`
9. Create controller in `interface/<entity>.controller.ts`
10. Wire everything in `<entity>.module.ts` with proper DI configuration

### Adding a New Use Case

1. Create use case class implementing `IUseCase<TInput, TOutput>`
2. Inject required repository ports via constructor using `@Inject(TOKEN)` decorator
3. Implement `execute()` method with business logic
4. Register in module providers
5. Inject into controller and call from endpoint handler

### Working with Mappers

All Prisma models must be converted to/from domain entities using mappers:
- `toDomain()`: Prisma model → domain entity
- `toPrisma()`: Domain entity → Prisma create/update input
- Mappers handle nested relations and data transformations

## Debugging

- **Development logs**: All logs printed in Korean with pretty formatting (pino-pretty)
- **Log Level**: Development mode uses DEBUG level by default (all logs shown)
- **Database queries**: Set `DATABASE_URL` with `?logging=true` to see Prisma queries
- **Debug mode**: `pnpm run start:debug` runs with Node inspector on port 9229
- **Pino Logger**: Use `logger.setContext('ClassName')` to add context to logs

Example logging:
```typescript
// In any Injectable service
constructor(private readonly logger: PinoLogger) {
  this.logger.setContext(MyService.name);
}

// Logs will show as:
// [정보] [MyService] 파일 업로드 성공: file.jpg
logger.info(`파일 업로드 성공: ${filename}`);
```
