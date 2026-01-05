import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { Logger } from 'nestjs-pino';
import { ZodValidationPipe } from 'nestjs-zod';

/**
 * 애플리케이션 부트스트랩 함수
 *
 * Hexagonal Architecture 및 Clean Architecture 원칙을 따릅니다:
 * 1. 모든 필수 환경변수는 ConfigModule에서 검증됨
 * 2. 글로벌 Zod 검증 파이프 설정
 * 3. 글로벌 예외 필터 설정
 * 4. Swagger 문서 생성
 * 5. Pino 기반 로거 초기화
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // 로거 설정
  const logger = app.get(Logger);
  app.useLogger(logger);

  // 글로벌 Zod 검증 파이프 (모든 DTO에 Zod 스키마 사용)
  app.useGlobalPipes(new ZodValidationPipe());

  // CORS 설정
  app.enableCors({
    credentials: true,
    origin: process.env.CORS_ORIGIN || '*',
  });

  // 글로벌 예외 필터
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger 문서 설정
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sundey CRM API')
    .setDescription('Sundey 백엔드 CRM API 문서 - Clean Architecture 기반')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'JWT 토큰을 입력하세요',
        in: 'header',
      },
      'jwt',
    )
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // 서버 시작
  const port = Number(process.env.PORT ?? 3000);
  const nodeEnv = process.env.NODE_ENV ?? 'development';

  await app.listen(port, '0.0.0.0');

  // 시작 로그
  console.log(`✅ Sundey CRM API 서버가 시작되었습니다`);
  console.log(`🌍 환경: ${nodeEnv}`);
  console.log(`🚀 API 서버: http://localhost:${port}`);
  console.log(`📚 Swagger 문서: http://localhost:${port}/api`);

  // 종료 신호 처리 (Graceful Shutdown)
  process.on('SIGTERM', async () => {
    logger.warn('⚠️  SIGTERM 신호 수신 - 서버 종료 중...');
    await app.close();
    logger.log('✅ 서버 종료 완료');
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.warn('⚠️  SIGINT 신호 수신 - 서버 종료 중...');
    await app.close();
    logger.log('✅ 서버 종료 완료');
    process.exit(0);
  });
}

// 애플리케이션 시작
void bootstrap();

