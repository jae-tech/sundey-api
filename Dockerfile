FROM node:24-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build argument for DATABASE_URL (placeholder for prisma generate)
ARG DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder

# Generate Prisma Client
RUN DATABASE_URL=${DATABASE_URL} npx prisma generate

# Build application
RUN pnpm run build

# Production stage
FROM node:24-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma Client in production stage
RUN DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder npx prisma generate

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/main.js"]
