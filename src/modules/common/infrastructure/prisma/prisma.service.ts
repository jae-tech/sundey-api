import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma-client';

import { PrismaPg } from '@prisma/adapter-pg';
import { Client } from 'pg';

import { IDatabasePort } from '@core/ports/database.port';

/**
 * Prisma 어댑터 서비스
 *
 * Hexagonal Architecture의 어댑터 계층 구현.
 * IDatabasePort 인터페이스를 구현하여 Prisma를 통한 데이터베이스 접근을 제공합니다.
 * NestJS의 OnModuleInit, OnModuleDestroy 라이프사이클을 통해 Prisma Client를 관리합니다.
 */
@Injectable()
export class PrismaService implements IDatabasePort, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private prismaClient: PrismaClient | null = null;

  /**
   * PrismaService 생성자
   * Lazy initialization: onModuleInit에서 PrismaClient를 초기화합니다.
   */
  constructor() {
    // PrismaClient는 onModuleInit에서 초기화됩니다.
  }

  /**
   * NestJS 모듈 초기화 시 호출
   * Prisma Client를 생성하고 데이터베이스에 연결합니다.
   */
  async onModuleInit(): Promise<void> {
    try {
      // DATABASE_URL 검증
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error('[ERROR] DATABASE_URL environment variable is not set');
      }
      // Prisma v7 - PostgreSQL adapter 사용
      const client = new Client({
        connectionString: databaseUrl,
      });

      const adapter = new PrismaPg(client);

      // PrismaClient 초기화
      this.prismaClient = new PrismaClient({ adapter });

      // 데이터베이스 연결 테스트
      await this.prismaClient.$connect();
      this.logger.log('[INFO] Prisma Client connected successfully');
    } catch (error) {
      this.logger.error('[ERROR] Prisma Client connection failed', error);
      throw error;
    }
  }

  /**
   * NestJS 모듈 종료 시 호출
   * Prisma Client 연결을 종료합니다.
   */
  async onModuleDestroy(): Promise<void> {
    try {
      if (this.prismaClient) {
        await this.prismaClient.$disconnect();
      }
      this.logger.log('[INFO] Prisma Client disconnected');
    } catch (error) {
      this.logger.error('[ERROR] Failed to disconnect Prisma Client', error);
    }
  }

  /**
   * Prisma Client 인스턴스 반환
   * @returns PrismaClient 인스턴스
   */
  getClient(): PrismaClient {
    if (!this.prismaClient) {
      throw new Error('[ERROR] Prisma Client is not initialized');
    }
    return this.prismaClient;
  }

  /**
   * 데이터베이스 연결 확인
   * @returns 연결 상태 (true: 연결됨, false: 연결 안 됨)
   */
  async isConnected(): Promise<boolean> {
    try {
      if (!this.prismaClient) return false;
      await this.prismaClient.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.warn('[WARN] Database connection check failed', error);
      return false;
    }
  }

  /**
   * 데이터베이스 연결 종료
   */
  async disconnect(): Promise<void> {
    if (this.prismaClient) {
      await this.prismaClient.$disconnect();
    }
  }
}
