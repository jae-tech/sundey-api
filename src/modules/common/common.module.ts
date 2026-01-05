import { Module } from '@nestjs/common';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { DATABASE_PORT } from '@core/ports/tokens';

/**
 * Common 모듈
 *
 * 애플리케이션 전체에서 사용하는 공통 인프라를 제공합니다.
 * - Prisma Service (데이터베이스 접근)
 * - Logger Adapter (로깅)
 */
@Module({
  providers: [
    {
      provide: DATABASE_PORT,
      useClass: PrismaService,
    },
    // PrismaService는 다른 모듈에서도 직접 사용할 수 있도록 제공
    PrismaService,
  ],
  exports: [DATABASE_PORT, PrismaService],
})
export class CommonModule {}
