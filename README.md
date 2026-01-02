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
- **Database**: PostgreSQL
- **ORM**: Prisma 5.22
- **Cache**: Redis
- **Queue**: BullMQ
- **Authentication**: JWT + Refresh Token
- **Logging**: Pino (구조화된 JSON 로깅)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger (OpenAPI)
- **Container**: Docker, Docker Compose

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

```bash
# 모든 서비스 시작 (API, PostgreSQL, Redis, Worker, Nginx)
docker-compose up -d

# 로그 확인
docker-compose logs -f api

# 서비스 중지
docker-compose down

# 볼륨까지 삭제
docker-compose down -v
```

Docker Compose로 실행하면:
- Nginx (Reverse Proxy): http://localhost:80
- API: http://localhost:3000
- Swagger: http://localhost:3000/api
- PostgreSQL: localhost:5432
- Redis: localhost:6379

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

| 레벨 | 값 | 용도 |
|------|---|----|
| **트레이스** | 10 | 매우 상세한 디버깅 정보 |
| **디버그** | 20 | 개발 중 디버깅 정보 |
| **정보** | 30 | 일반적인 정보성 메시지 |
| **경고** | 40 | 경고 메시지 |
| **에러** | 50 | 에러 메시지 |
| **심각** | 60 | 심각한 에러 |

### 환경별 로그 레벨

- **개발 환경**: `DEBUG` 레벨 (상세한 정보 포함)
- **프로덕션 환경**: `INFO` 레벨 (정보 이상만 출력)

### 한글 로그 메시지

모든 로그 메시지는 한글로 작성되어 있습니다:

```typescript
// 예제
logger.info(`파일 업로드 성공: ${objectName}`);
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
    this.logger.info(`작업 시작`);
    // ...
    this.logger.error(`작업 실패: ${error.message}`);
  }
}
```

## 트러블슈팅

### Prisma Client 오류

```bash
npx prisma generate
```

### TypeScript Path Alias 오류

`tsconfig.json`의 paths 설정 확인:

```json
{
  "paths": {
    "@/*": ["src/*"],
    "@common/*": ["src/common/*"],
    "@core/*": ["src/core/*"],
    "@modules/*": ["src/modules/*"],
    "@configs/*": ["src/configs/*"]
  }
}
```

## 라이센스

UNLICENSED

## 프로젝트 생성 완료

Sundey CRM Backend 프로젝트가 성공적으로 생성되었습니다!
