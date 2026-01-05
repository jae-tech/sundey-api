# Docker Compose 설정 가이드

## 개요

이 프로젝트는 **로컬 개발**과 **프로덕션** 환경을 분리한 Docker Compose 설정을 사용합니다.

### 파일 구조

```
docker-compose.yml                   # 공통 설정 (Base configuration)
docker-compose.override.yml          # 로컬 개발 환경 (자동 적용)
docker-compose.prod.yml              # 프로덕션 환경 (명시적 지정)
```

---

## 🔄 동작 방식

### **로컬 개발 환경**

```bash
# docker-compose.yml + docker-compose.override.yml 자동 병합
docker-compose up -d
```

**특징:**
- ✅ Hot reload (코드 변경 자동 감지)
- ✅ 외부 포트 노출 (5432, 6379, 4000)
- ✅ Nginx 미사용 (API 직접 접근)
- ✅ 로컬 코드 마운트 (볼륨 연결)
- ✅ 개발 모드 실행

---

### **프로덕션 환경**

```bash
# docker-compose.yml + docker-compose.prod.yml 병합
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**특징:**
- ✅ 프로덕션 빌드 이미지 사용 (미리 빌드된 이미지)
- ✅ Nginx reverse proxy (80, 443 노출)
- ✅ DB/Redis 내부 포트만 사용
- ✅ 자동 재시작 정책 (restart: always)
- ✅ 로그 로테이션 설정 (10MB마다 순환)
- ✅ 최소 리소스 사용

---

## 🚀 빠른 시작

### 1️⃣ **로컬 개발 환경 설정**

```bash
# 로컬 환경변수 파일 생성
cp .env.local.example .env.local

# .env.local에서 필요한 설정 수정
# (기본값으로 충분하면 그대로 사용 가능)

# 서비스 시작
docker-compose up -d

# 또는 로그를 보면서 시작
docker-compose up
```

### 2️⃣ **프로덕션 배포**

```bash
# 프로덕션 환경변수 파일 생성
cp .env.production.example .env.production

# .env.production에 실제 프로덕션 값 설정
vi .env.production

# 이미지 빌드 (DATABASE_URL 전달 - 실제 데이터베이스 URL 사용)
docker build \
  --build-arg DATABASE_URL="postgresql://prod_user:strong_password@db.production.com:5432/sundey_crm" \
  -t sundey-api:latest .

# 또는 .env.production에서 DATABASE_URL 읽기
export DB_URL=$(grep "^DATABASE_URL=" .env.production | cut -d= -f2)
docker build --build-arg DATABASE_URL="$DB_URL" -t sundey-api:latest .

# 서비스 시작 (미리 빌드된 이미지 사용)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 로그 확인
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f api
```

---

## 📋 자주 사용하는 명령어

### 로컬 개발

```bash
# 서비스 시작 (백그라운드)
docker-compose up -d

# 서비스 시작 (로그 보기)
docker-compose up

# 특정 서비스만 시작
docker-compose up -d postgres redis

# 로그 보기
docker-compose logs -f api

# 서비스 상태 확인
docker-compose ps

# 서비스 재시작
docker-compose restart api

# 컨테이너 진입
docker-compose exec api sh

# 전체 종료
docker-compose down

# 볼륨 포함 전체 종료 (데이터 삭제)
docker-compose down -v
```

### 프로덕션

```bash
# 프로덕션 환경 설정 파일 지정
export COMPOSE_FILE=docker-compose.yml:docker-compose.prod.yml

# 또는 매번 지정
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 프로덕션 로그 보기 (최근 100줄)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=100 api

# 프로덕션 서비스 상태
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps

# 프로덕션 종료
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
```

---

## 🔐 환경변수 설정

### 로컬 개발 (.env.local)

```bash
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://sundey:sundey123@localhost:5432/sundey_crm?schema=public
REDIS_HOST=localhost
JWT_SECRET=dev-secret-key-32-chars-minimum
```

### 프로덕션 (.env.production)

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@prod-db.example.com:5432/db
REDIS_HOST=prod-redis.example.com
JWT_SECRET=strong-production-secret-key-here
```

⚠️ **주의사항:**
- `.env.production` 파일은 **절대 Git에 커밋하지 마세요**
- 프로덕션 서버에서만 안전하게 관리하세요
- `.gitignore`에 `.env` 파일들이 포함되어 있습니다

---

## 🔧 Dockerfile 빌드 설정

### DATABASE_URL 빌드 인자 (Build Argument)

Prisma v7.2.0 이상에서는 `prisma generate` 단계에서 DATABASE_URL 환경변수가 필요합니다.

```dockerfile
ARG DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
RUN DATABASE_URL=${DATABASE_URL} npx prisma generate
```

**특징:**
- ✅ 기본값 제공 (placeholder URL)
- ✅ 빌드 시 DATABASE_URL 인자로 오버라이드 가능
- ✅ 프로덕션 빌드는 실제 DATABASE_URL 전달

**예:**
```bash
# 로컬 빌드 (기본값 사용)
docker build -t sundey-api:latest .

# 프로덕션 빌드 (실제 DATABASE_URL 전달)
docker build --build-arg DATABASE_URL="postgresql://prod_user:password@db.prod.com:5432/db" -t sundey-api:latest .
```

---

## 🐳 서비스 상세 정보

### PostgreSQL (5432)
- **로컬**: `localhost:5432`
- **프로덕션**: 내부 통신만 (포트 미노출)
- **볼륨**: `postgres_data`

### Redis (6379)
- **로컬**: `localhost:6379`
- **프로덕션**: 내부 통신만 (포트 미노출)
- **볼륨**: `redis_data`

### API Server (3000/4000)
- **로컬**: `localhost:4000` (hot reload 활성화, nginx 미사용)
- **프로덕션**: `localhost:3000` (내부)
- **Nginx**: `http://localhost` (80포트, 프로덕션만)

---

## 🔄 환경 전환

### 환경변수 파일 변경

```bash
# .env.local 또는 .env.production 중 선택
# Docker Compose는 자동으로 현재 디렉토리의 .env 파일을 로드합니다

# 로컬 -> 프로덕션으로 전환
rm .env
cp .env.production .env
# .env 파일 수정 후
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 🐛 문제 해결

### 포트 충돌

```bash
# 포트 사용 중인 프로세스 확인
lsof -i :4000

# 또는 Windows
netstat -ano | findstr :4000

# 기존 컨테이너 강제 종료
docker-compose down -v
docker system prune -a
```

### 데이터베이스 연결 실패

```bash
# PostgreSQL 상태 확인
docker-compose ps postgres

# PostgreSQL 로그 확인
docker-compose logs postgres

# 컨테이너 재시작
docker-compose restart postgres
```

### 마이그레이션 실패

```bash
# 프로덕션에서 수동 마이그레이션 실행
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec api npx prisma migrate deploy
```

---

## 📊 모니터링

### 리소스 사용량

```bash
docker stats
```

### 컨테이너 내부 확인

```bash
# API 컨테이너 진입
docker-compose exec api sh

# 프로덕션 API 컨테이너 진입
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec api sh

# PostgreSQL 접속
docker-compose exec postgres psql -U sundey -d sundey_crm
```

---

## 🚀 프로덕션 배포 체크리스트

- [ ] `.env.production` 파일 생성 및 값 입력
- [ ] 강력한 JWT_SECRET 설정 (openssl rand -base64 32)
- [ ] **Docker 이미지 빌드** (실제 DATABASE_URL과 함께)
  ```bash
  docker build --build-arg DATABASE_URL="$DB_URL" -t sundey-api:latest .
  ```
- [ ] 데이터베이스 백업 정책 수립
- [ ] Redis 백업 정책 수립
- [ ] 로그 로테이션 설정 확인 (docker-compose.prod.yml에 설정됨)
- [ ] SSL/TLS 인증서 설정 (Nginx)
- [ ] 방화벽 규칙 설정 (포트 80, 443만 오픈)
- [ ] 모니터링 및 알림 설정
- [ ] 자동 재시작 정책 확인 (restart: always)

---

## 📚 참고

- [Docker Compose 공식 문서](https://docs.docker.com/compose/)
- [Docker Compose File 참조](https://docs.docker.com/compose/compose-file/)
- [환경변수 설정 가이드](https://docs.docker.com/compose/environment-variables/)
