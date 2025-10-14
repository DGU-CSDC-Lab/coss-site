# iot-site
지능IoT학과 홈페이지

## 개발 환경 실행

```bash
# 의존성 설치
make install

# 로컬 개발 환경 
# 포트 충돌이 없도록 조심하세요.
make start

# 종료
# Ctrl + C 로 실행 server, web을 한 번에 종료할 수 있습니다.

# 컨테이너, 이미지 등 모든 리소스 제거 (데이터도 제거되니 조심)
make clean

# 테스트 실행
make test

# 빌드 실행
make build
```

## 환경 초기화
DB 혹은 전체 assets 들의 초기화가 필요한 경우 사용 해주세요.

```bash
# 컨테이너, 이미지 등 모든 리소스 제거 (데이터도 제거되니 조심)
make clean
```

## 로깅 환경
- server: `server/server.log`
- web: `web/web.log`

gitignore로 등록 되어있습니다.

## commit push 전 유의사항
테스트와 빌드를 성공시킨 후 commit push 해주세요.
ci/cd에서 막힙니다.
```bash
# 테스트 실행
make test

# 빌드 실행
make build
```

## 헬프 명령어
```bash
make help # 사용 가능한 명령어 확인
```

## 접속 정보

- 웹: http://localhost:5173
- API: http://localhost:3000/api-docs
- MariaDB: localhost:3306

### 기타 개발 환경
- MariaDB: 포트 3308
- MinIO: 포트 9000 (API), 9001 (Console)
- MailHog: 포트 1025 (SMTP), 8025 (Web UI)

## 프로젝트 스펙

### 아키텍처
- 프론트엔드: React 18 + TypeScript + Vite
- 백엔드: NestJS + TypeScript + Node.js 24+
- 데이터베이스: MariaDB 10.11
- 파일 저장소: AWS S3 (로컬: MinIO)
- 이메일: AWS SES (로컬: MailHog)

### 개발 환경
- Node.js: 24.0.0 이상
- 패키지 매니저: npm
- 컨테이너: Docker Compose
- 빌드 도구: Vite (프론트), NestJS CLI (백엔드)

### 주요 라이브러리

#### 백엔드 (NestJS)
- 프레임워크: NestJS 10.x
- ORM: TypeORM 0.3.17
- 데이터베이스: MariaDB, MySQL2
- 인증: JWT, Passport, bcrypt
- 파일 업로드: AWS SDK S3, Multer
- API 문서: Swagger
- 이메일: Nodemailer
- 엑셀 처리: xlsx
- 테스트: Jest, Supertest

#### 프론트엔드 (React)
- UI 프레임워크: React 18, React Router DOM 7.x
- 상태 관리: Zustand 4.x, TanStack Query 5.x
- 스타일링: Tailwind CSS 3.x, Heroicons
- 유틸리티: clsx, xlsx
- 테스트: Jest, Testing Library

### 개발 도구
- 린터: ESLint 8.x/9.x
- 포매터: Prettier 3.x
- 타입 체커: TypeScript 5.x
- 테스트: Jest 29.x
- 빌드: Vite 7.x, NestJS CLI

### 주요 기능 모듈
- 인증/권한: JWT 기반 사용자 인증
- 파일 관리: S3 Presigned URL 업로드
- 게시판: 공지사항, 자료실
- 강의 관리: 강의 정보, 엑셀 업로드
- 교수진: 교수 정보 관리
- 팝업: 메인 페이지 팝업 관리
- 일정: 학사 일정 관리
- 헤더 에셋: 메인 배너 관리

