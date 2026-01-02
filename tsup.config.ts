import { defineConfig } from 'tsup';

export default defineConfig({
  // 진입점
  entry: ['src/main.ts'],

  // 출력 형식
  format: ['esm'],

  // 타겟 환경
  target: 'node18',
  platform: 'node',

  // 출력 디렉토리
  outDir: 'dist',

  // 빌드 전 dist 폴더 정리
  clean: true,

  // TypeScript 설정
  tsconfig: './tsconfig.json',

  // 개발/프로덕션 모드 구분
  minify: process.env.NODE_ENV === 'production',
  sourcemap: process.env.NODE_ENV !== 'production',

  // 외부 의존성 (번들에 포함하지 않음)
  external: [
    // NestJS
    '@nestjs/common',
    '@nestjs/core',
    '@nestjs/platform-fastify',
    '@nestjs/platform-express',
    '@nestjs/config',
    '@nestjs/jwt',
    '@nestjs/passport',
    '@nestjs/swagger',
    '@nestjs/testing',

    // Database & ORM
    '@prisma/client',

    // Fastify
    'fastify',
    '@fastify/static',

    // Authentication
    'passport',
    'passport-jwt',
    'bcrypt',

    // Queue & Cache
    'bullmq',

    // Validation & Transformation
    'class-validator',
    'class-transformer',

    // Utilities
    'reflect-metadata',
    'rxjs',
  ],

  // 번들 분할 비활성화 (단일 번들)
  splitting: false,

  // Tree shaking 비활성화 (NestJS 모듈이 제거되는 문제 방지)
  treeshake: false,

  // 진행 상황 표시
  silent: false,

  // esbuild 옵션
  esbuildOptions(options) {
    // Path alias 해석을 위해 resolveExtensions 추가
    options.resolveExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
  },
});
