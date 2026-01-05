import { PrismaClient } from '@prisma/client';

/**
 * 데이터베이스 포트 (인터페이스)
 *
 * Hexagonal Architecture의 핵심 포트.
 * 애플리케이션 계층은 이 인터페이스를 통해서만 데이터베이스에 접근합니다.
 * 실제 구현(Prisma 어댑터)은 infrastructure 계층에서 이루어집니다.
 */
export interface IDatabasePort {
  /**
   * Prisma Client 인스턴스
   * 모든 데이터베이스 작업은 이를 통해 수행됩니다.
   */
  getClient(): PrismaClient;

  /**
   * 데이터베이스 연결 확인
   * 헬스 체크 및 연결 검증에 사용됩니다.
   */
  isConnected(): Promise<boolean>;

  /**
   * 데이터베이스 연결 종료
   * 애플리케이션 종료 시 호출됩니다.
   */
  disconnect(): Promise<void>;
}

/**
 * 데이터베이스 포트 토큰
 * Dependency Injection에서 IDatabasePort를 주입받을 때 사용하는 토큰입니다.
 */
export const DATABASE_PORT = Symbol('DATABASE_PORT');
