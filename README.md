# iot-site
지능IoT학과 홈페이지

## 개발 환경 실행

```bash
# 개발 환경 시작 (코드 변경 시 자동 재시작)
make dev

# 컨테이너 백그라운드 실행
make up

# 컨테이너 중지
make down

# 로그 확인
make logs

# 테스트 실행
make test
```

## 주요 명령어

- `make help` - 사용 가능한 명령어 확인
- `make dev` - 개발 서버 시작 (hot reload)
- `make clean` - 컨테이너 및 볼륨 정리
- `make db-shell` - 데이터베이스 접속

## 접속 정보

- 웹: http://localhost:3000
- API: http://localhost:3001/api
- MariaDB: localhost:3306
