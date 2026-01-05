import { z } from 'zod';

/**
 * 환경변수 검증 스키마
 * 애플리케이션 시작 시 모든 필수 환경변수를 검증합니다.
 */
export const envValidationSchema = z.object({
  // 애플리케이션
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // 데이터베이스
  DATABASE_URL: z.string().url().describe('PostgreSQL 연결 문자열'),

  // JWT
  JWT_SECRET: z.string().min(32).describe('JWT 시크릿 키 (최소 32자)'),
  JWT_EXPIRES_IN: z.string().default('1h').describe('JWT 토큰 만료 시간'),

  // JWT Refresh
  JWT_REFRESH_SECRET: z.string().min(32).describe('JWT Refresh 시크릿 키'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d').describe('JWT Refresh 토큰 만료 시간'),

  // Redis
  REDIS_HOST: z.string().default('localhost').describe('Redis 호스트'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379).describe('Redis 포트'),

  // BullMQ
  BULL_QUEUE_NAME: z.string().default('sundey-queue').describe('BullMQ 큐 이름'),

  // CORS
  CORS_ORIGIN: z.string().optional().describe('CORS 허용 도메인'),

  // OCI (Oracle Cloud)
  OCI_NAMESPACE: z.string().optional().describe('OCI Object Storage 네임스페이스'),
  OCI_BUCKET_NAME: z.string().optional().describe('OCI 버킷 이름'),
  OCI_REGION: z.string().optional().describe('OCI 리전'),
  OCI_USER_ID: z.string().optional().describe('OCI 사용자 ID'),
  OCI_TENANCY_ID: z.string().optional().describe('OCI 테넌시 ID'),
  OCI_FINGERPRINT: z.string().optional().describe('OCI 핑거프린트'),
  OCI_PRIVATE_KEY_PATH: z.string().optional().describe('OCI 개인키 경로'),

  // AWS S3 (선택사항)
  AWS_REGION: z.string().optional().describe('AWS 리전'),
  AWS_ACCESS_KEY_ID: z.string().optional().describe('AWS 액세스 키'),
  AWS_SECRET_ACCESS_KEY: z.string().optional().describe('AWS 시크릿 키'),
  AWS_S3_BUCKET: z.string().optional().describe('AWS S3 버킷 이름'),
});

export type EnvType = z.infer<typeof envValidationSchema>;
