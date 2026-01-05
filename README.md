# Sundey CRM Backend

**Hybrid Clean Architecture + Hexagonal Architecture** 기반의 NestJS CRM 백엔드 시스템

## 아키텍처

이 프로젝트는 **Hybrid Clean Architecture**와 **Hexagonal Architecture (Ports & Adapters)** 패턴을 채택하여 구현되었습니다.

### 레이어 구조

```
modules/<domain>/
 ├─ domain/            → 엔티티, 상태 규칙, 도메인 서비스 (순수 로직)
 ├─ application/       → UseCase (비즈니스 흐름)
 ├─ infrastructure/    → Repository Adapter (Prisma), Queue Adapter, Redis Adapter
 ├─ interface/         → Controller, DTO, ViewModel
 └─ <domain>.module.ts
```

### 의존성 규칙

- **interface → application → domain** 방향으로만 의존 가능
- **domain**은 절대 infra나 NestJS에 의존하지 않음
- **infrastructure**는 application에서 선언된 Port(interface)를 구현
- Repository 호출은 **Port → Adapter** 구조로 구현

## 기술 스택

- **Framework**: NestJS (Fastify)
- **Database**: PostgreSQL + Prisma v7.2.0 (PrismaPg adapter)
- **ORM**: Prisma v7.2.0 (Prisma Data Platform)
- **Database Adapter**: @prisma/adapter-pg
- **Cache**: Redis
- **Queue**: BullMQ
- **Authentication**: JWT + Refresh Token
- **Logging**: Pino (구조화된 JSON 로깅) + nestjs-pino
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger (OpenAPI)
- **Container**: Docker, Docker Compose (로컬/프로덕션 환경 분리)
- **Build**: tsup (ESM, Tree-shaking disabled)

## 프로젝트 구조

```
project/
 ├─ src/
 │    ├─ main.ts
 │    ├─ app.module.ts
 │    ├─ common/                  # 공통 유틸리티
 │    │     ├─ decorators/
 │    │     ├─ exceptions/
 │    │     ├─ filters/
 │    │     ├─ guards/
 │    │     ├─ interceptors/
 │    │     └─ utils/
 │    ├─ core/                    # 핵심 레이어
 │    │     ├─ ports/             # 모든 Port 인터페이스
 │    │     ├─ base.usecase.ts
 │    │     └─ base.entity.ts
 │    ├─ modules/                 # 도메인 모듈
 │    │     ├─ auth/
 │    │     ├─ users/
 │    │     ├─ invitations/
 │    │     ├─ customers/
 │    │     ├─ services/
 │    │     ├─ reservations/
 │    │     └─ queue/
 │    ├─ configs/                 # 설정 파일
 │    │     ├─ app.config.ts
 │    │     ├─ database.config.ts
 │    │     ├─ jwt.config.ts
 │    │     ├─ redis.config.ts
 │    │     └─ logger.config.ts (Pino 로거)
 │    └─ global.module.ts
 │
 ├─ prisma/
 │     └─ schema.prisma
 │
 ├─ docker/
 │     └─ nginx/nginx.conf
 │
 ├─ docker-compose.yml
 ├─ Dockerfile
 ├─ .env.example
 └─ README.md
```

## 시작하기

### 1. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 필요한 값을 수정하세요.

### 2. 로컬 개발 환경

```bash
# 의존성 설치
pnpm install

# Prisma Client 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 개발 서버 실행 (hot reload 포함)
pnpm run dev
```

서버가 실행되면:

- API: http://localhost:3000
- Swagger 문서: http://localhost:3000/api
- 모든 로그는 한글로 출력됩니다

### 3. Docker로 실행

#### 로컬 개발 환경

```bash
# 환경변수 파일 생성
cp .env.example .env

# 모든 서비스 시작 (docker-compose.yml + docker-compose.override.yml 자동 병합)
docker-compose up -d

# 로그 확인
docker-compose logs -f api

# 서비스 중지
docker-compose down

# 볼륨까지 삭제 (데이터 초기화)
docker-compose down -v
```

**로컬 개발 환경의 특징:**
- ✅ Hot reload 활성화 (코드 변경 시 자동 재시작)
- ✅ 외부 포트 노출: 5432 (PostgreSQL), 6379 (Redis), 4000 (API)
- ✅ Nginx 미사용 (API에 직접 접근)
- ✅ 로컬 코드 마운트 (볼륨 연결)
- ✅ 개발 모드 실행

로컬 환경에서 접속:
- API: http://localhost:4000
- Swagger: http://localhost:4000/api
- PostgreSQL: localhost:5432
- Redis: localhost:6379

#### 프로덕션 환경

```bash
# 프로덕션 환경변수 파일 생성
cp .env.example .env.production
# .env.production 수정 필요

# Docker 이미지 빌드 (실제 DATABASE_URL과 함께)
export DB_URL=$(grep "^DATABASE_URL=" .env.production | cut -d= -f2)
docker build --build-arg DATABASE_URL="$DB_URL" -t sundey-api:latest .

# 프로덕션 서비스 시작 (docker-compose.yml + docker-compose.prod.yml 병합)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 프로덕션 로그 확인
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f api

# 프로덕션 서비스 중지
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
```

**프로덕션 환경의 특징:**
- ✅ 미리 빌드된 이미지 사용
- ✅ Nginx reverse proxy (80, 443 포트)
- ✅ DB/Redis 내부 포트만 사용 (외부 노출 안 함)
- ✅ 자동 재시작 정책 (restart: always)
- ✅ 로그 로테이션 설정 (10MB마다 순환)
- ✅ 최소 리소스 사용

프로덕션 환경에서 접속:
- Nginx (Reverse Proxy): http://localhost:80
- API (내부): http://localhost:3000
- Swagger: http://localhost/api

**자세한 Docker Compose 설정 가이드는 [DOCKER_COMPOSE.md](./DOCKER_COMPOSE.md) 참고**

## 주요 기능

### 인증 (Auth)

- **회원가입**: 회사 생성 및 OWNER 계정 생성
- **로그인**: JWT AccessToken + RefreshToken 발급
- **JWT 기반 인증**: 모든 API는 기본적으로 JWT 인증 필요 (@Public() 데코레이터로 제외 가능)

### 초대 (Invitations)

- **초대장 생성**: OWNER가 직원 초대 링크 생성
- **초대 수락**: UUID 토큰으로 직원 가입
- 초대장 만료 및 사용 여부 관리

### 고객 (Customers)

- **고객 생성**: phone + companyId unique constraint
- **고객 조회**: 회사별 고객 목록

### 서비스 (Services)

- **서비스 생성**: 이름, 가격, 소요 시간 설정
- **서비스 조회**: 회사별 서비스 목록

### 예약 (Reservations)

- **예약 생성**: PENDING_INQUIRY 상태로 시작
- **예약 확정**: CONFIRMED 전환 시 고객 자동 생성
  1. phone으로 고객 조회
  2. 없으면 자동 생성
  3. customerId 업데이트
- **상태 전이**: PENDING_INQUIRY → CONFIRMED → WORKING → DONE
- **직원 배정**: assignedUserId 설정
- **결제 관리**: 부분 결제 지원, 미수금 조회

### 상태 전이 규칙

```
PENDING_INQUIRY → CONFIRMED → WORKING → DONE
                ↓             ↓
            CANCELLED     CANCELLED
```

- **PENDING_INQUIRY**: 예약 문의
- **CONFIRMED**: 예약 확정 (고객 자동 생성)
- **WORKING**: 서비스 진행 중
- **DONE**: 서비스 완료
- **CANCELLED**: 취소
- **NO_SHOW**: 노쇼

## 데이터베이스 마이그레이션

```bash
# 마이그레이션 생성
npx prisma migrate dev --name init

# 마이그레이션 적용
npx prisma migrate deploy

# Prisma Studio (DB GUI)
npx prisma studio
```

## API 문서

애플리케이션 실행 후 Swagger 문서에서 모든 API를 확인할 수 있습니다:

- 로컬: http://localhost:3000/api
- Docker: http://localhost/api

### 주요 엔드포인트

#### Auth

- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인

#### Users

- `GET /users/me` - 현재 사용자 정보
- `GET /users/:id` - 사용자 조회
- `GET /users/company/:companyId` - 회사별 사용자 목록

#### Invitations

- `POST /invitations` - 초대장 생성 (OWNER only)
- `POST /invitations/accept` - 초대 수락

#### Customers

- `POST /customers` - 고객 생성
- `GET /customers/company/:companyId` - 회사별 고객 목록

#### Services

- `POST /services` - 서비스 생성
- `GET /services/company/:companyId` - 회사별 서비스 목록

#### Reservations

- `POST /reservations` - 예약 생성
- `POST /reservations/:id/confirm` - 예약 확정 (고객 자동 생성)
- `PATCH /reservations/:id/assign` - 직원 배정
- `PATCH /reservations/:id/status` - 상태 변경
- `POST /reservations/:id/payment` - 결제 처리
- `GET /reservations/unpaid/company/:companyId` - 미수금 조회

## 개발 스크립트

```bash
# 개발 서버 (watch mode)
pnpm run dev

# 프로덕션 빌드
pnpm run build

# 프로덕션 실행
pnpm run start

# 테스트
pnpm run test

# 테스트 (watch mode)
pnpm run test:watch

# 테스트 커버리지
pnpm run test:cov

# 코드 포맷팅
pnpm run format

# 린트 (자동 수정)
pnpm run lint
```

## 아키텍처 가이드라인

### UseCase 작성 규칙

1. 각 UseCase는 `IUseCase<TInput, TOutput>` 인터페이스를 구현
2. `execute()` 메서드로 비즈니스 로직 실행
3. Port를 통해 Repository, Queue 등 외부 시스템 호출
4. DTO → Entity 변환은 interface layer에서 수행

### Port & Adapter 패턴

1. **Port 정의**: `src/core/ports/` 에 인터페이스 정의
2. **Adapter 구현**: `infrastructure/` 에서 Port 구현
3. **의존성 주입**: Module에서 Port를 Adapter로 연결

```typescript
@Module({
  providers: [
    {
      provide: IUserRepository,  // Port
      useClass: PrismaUserAdapter,  // Adapter
    },
  ],
})
```

### Domain Layer 규칙

- 순수 TypeScript/JavaScript만 사용
- NestJS, Prisma 등 프레임워크 의존성 금지
- 비즈니스 규칙과 상태 전이 로직만 포함

## 로깅 (Logging)

프로젝트는 Pino 구조화된 로깅 시스템을 사용합니다.

### 로그 레벨

| 레벨         | 값  | 용도                    |
| ------------ | --- | ----------------------- |
| **트레이스** | 10  | 매우 상세한 디버깅 정보 |
| **디버그**   | 20  | 개발 중 디버깅 정보     |
| **정보**     | 30  | 일반적인 정보성 메시지  |
| **경고**     | 40  | 경고 메시지             |
| **에러**     | 50  | 에러 메시지             |
| **심각**     | 60  | 심각한 에러             |

### 환경별 로그 레벨

- **개발 환경**: `DEBUG` 레벨 (상세한 정보 포함)
- **프로덕션 환경**: `INFO` 레벨 (정보 이상만 출력)

### 한글 로그 메시지

모든 로그 메시지는 한글로 작성되어 있습니다:

```typescript
// 예제
logger.log(`파일 업로드 성공: ${objectName}`);
logger.warn(`설정이 완료되지 않았습니다`);
logger.error(`파일 업로드 실패: ${error.message}`);
```

### 로거 사용 방법

```typescript
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class MyService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(MyService.name);
  }

  doSomething() {
    this.logger.log(`작업 시작`);
    // ...
    this.logger.error(`작업 실패: ${error.message}`);
  }
}
```

## Prisma v7.2.0 마이그레이션

### PrismaPg Adapter 패턴

Prisma v7.2.0부터는 PostgreSQL 연결 시 **반드시 PrismaPg adapter**를 사용해야 합니다.

#### PrismaService 초기화 패턴

```typescript
import { PrismaClient } from '@prisma-client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Client } from 'pg';

async onModuleInit(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  // PostgreSQL 클라이언트 생성
  const client = new Client({
    connectionString: databaseUrl,
  });

  // PrismaPg 어댑터 생성
  const adapter = new PrismaPg(client);

  // PrismaClient 생성 (반드시 adapter 옵션 필요)
  this.prismaClient = new PrismaClient({ adapter });

  // 연결 확인
  await this.prismaClient.$connect();
}
```

**중요 사항:**
- `new PrismaClient(){ adapter }` - adapter 필수
- `new PrismaClient()` 또는 `new PrismaClient({})` - 불가능
- Prisma Schema에 `engineType` 설정 금지

### Prisma Client 생성 오류

```bash
# Prisma Client 재생성
npx prisma generate

# 또는 캐시 초기화 후 재생성
rm -rf node_modules/.prisma
pnpm install
npx prisma generate
```

### Docker 빌드 시 DATABASE_URL 오류

```bash
# 빌드 인자로 DATABASE_URL 전달 필요
docker build \
  --build-arg DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -t sundey-api:latest .
```

## 트러블슈팅

### Docker Compose 포트 충돌

```bash
# 포트 사용 프로세스 확인 (Windows)
netstat -ano | findstr :4000

# Docker 캐시 초기화 및 정리
docker-compose down -v
docker system prune -a
```

### 데이터베이스 연결 실패

```bash
# PostgreSQL 컨테이너 로그 확인
docker-compose logs postgres

# 컨테이너 재시작
docker-compose restart postgres

# 수동 연결 테스트
docker-compose exec postgres psql -U sundey -d sundey_crm
```

### 마이그레이션 오류

```bash
# 프로덕션 환경에서 마이그레이션 수동 실행
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec api npx prisma migrate deploy

# 마이그레이션 상태 확인
npx prisma migrate status
```

### TypeScript Path Alias 오류

`tsconfig.json`의 paths 설정 확인:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@common/*": ["src/common/*"],
      "@core/*": ["src/core/*"],
      "@modules/*": ["src/modules/*"],
      "@configs/*": ["src/configs/*"]
    }
  }
}
```

**중요:** path alias 설정이 필요함
- ✅ `import { PrismaClient } from '@prisma-client'` (path alias 사용)
- ❌ `import { PrismaClient } from '@prisma/client'` (직접 npm 패키지 사용 금지)

`tsconfig.json`에 다음과 같이 path alias를 설정해야 합니다:
```json
{
  "compilerOptions": {
    "paths": {
      "@prisma-client": ["node_modules/@prisma/client"]
    }
  }
}
```

## 설치 및 구성 가이드

### 필수 요소

- **Node.js**: v20.x 이상
- **pnpm**: v8.x 이상
- **Docker & Docker Compose**: 최신 버전
- **PostgreSQL**: 별도 설치 또는 Docker 컨테이너
- **Redis**: 별도 설치 또는 Docker 컨테이너

### 초기 설정

```bash
# 1. 의존성 설치
pnpm install

# 2. 환경변수 설정
cp .env.example .env
# .env 파일 수정 (DATABASE_URL, JWT_SECRET 등)

# 3. Prisma Client 생성
npx prisma generate

# 4. 데이터베이스 마이그레이션
npx prisma migrate dev --name init

# 5. 개발 서버 실행
pnpm run dev
```

### 환경변수 설정 예제

```bash
# 로컬 개발 환경 (.env)
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://sundey:sundey123@localhost:5432/sundey_crm?schema=public
JWT_SECRET=dev-secret-key-32-chars-minimum
JWT_EXPIRES_IN=3600
JWT_REFRESH_SECRET=dev-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=604800
REDIS_HOST=localhost
REDIS_PORT=6379
BULL_QUEUE_NAME=sundey-queue
CORS_ORIGIN=http://localhost:3000
```

## 파일 구조 및 역할

### 핵심 설정 파일

| 파일 | 역할 |
|------|------|
| `docker-compose.yml` | 기본 Docker Compose 설정 |
| `docker-compose.override.yml` | 로컬 개발 환경 오버라이드 (자동 적용) |
| `docker-compose.prod.yml` | 프로덕션 환경 오버라이드 (명시적 지정) |
| `Dockerfile` | 프로덕션 Docker 이미지 빌드 |
| `prisma/schema.prisma` | 데이터베이스 스키마 정의 |
| `.env` | 로컬 개발 환경변수 |
| `CLAUDE.md` | Claude Code 개발 가이드 |
| `DOCKER_COMPOSE.md` | Docker Compose 상세 가이드 |

### 프로젝트 초기화 이력

이 프로젝트는 다음 작업을 통해 구성되었습니다:

1. **Clean/Hexagonal Architecture** 구축
   - Port & Adapter 패턴 구현
   - 레이어별 의존성 규칙 적용

2. **Docker Compose 환경 분리**
   - 로컬 개발 환경 (hot reload, 외부 포트 노출)
   - 프로덕션 환경 (Nginx, 내부 포트, 자동 재시작)
   - [DOCKER_COMPOSE.md](./DOCKER_COMPOSE.md) 참조

3. **Prisma v7.2.0 마이그레이션**
   - PrismaPg adapter 패턴 도입
   - Database URL 런타임 초기화
   - Dockerfile에 빌드 인자 추가

4. **Pino 로깅 시스템**
   - JSON 구조화 로깅
   - 환경별 로그 레벨 설정
   - 한글 로그 메시지 지원

5. **Fastify + NestJS 통합**
   - JWT 기반 인증
   - Swagger API 문서
   - 전역 예외 처리

## 라이센스

UNLICENSED
