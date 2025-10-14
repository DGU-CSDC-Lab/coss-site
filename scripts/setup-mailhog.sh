#!/bin/bash

# MailHog 설정 스크립트
# 로컬 개발 환경에서 이메일 테스트를 위한 MailHog 설정

set -e

# 스크립트 디렉토리와 프로젝트 루트 경로 설정
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/server/.env.local"

echo "🚀 MailHog 설정을 시작합니다..."

# server/.env.local 파일에서 환경변수 로드
if [ -f "$ENV_FILE" ]; then
    # 주석과 빈 줄을 제거하고 환경변수 로드
    while IFS= read -r line; do
        # 주석이나 빈 줄 건너뛰기
        [[ $line =~ ^[[:space:]]*# ]] && continue
        [[ -z "${line// }" ]] && continue
        # 환경변수 export
        export "$line"
    done < "$ENV_FILE"
    echo "✅ Loaded $ENV_FILE"
else
    echo "❌ $ENV_FILE not found"
    exit 1
fi

# MailHog 컨테이너 상태 확인
if docker ps | grep -q "coss-mailhog"; then
    echo "✅ MailHog가 이미 실행 중입니다."
else
    echo "📧 MailHog 컨테이너를 시작합니다..."
    docker-compose -f docker-compose.local.yml up -d mailhog
    
    # 컨테이너 시작 대기
    echo "⏳ MailHog 시작을 기다리는 중..."
    sleep 3
fi

# MailHog 상태 확인
if curl -s http://localhost:8025 > /dev/null; then
    echo "✅ MailHog가 성공적으로 실행되었습니다!"
    echo ""
    echo "📧 MailHog 접속 정보:"
    echo "   - Web UI: http://localhost:8025"
    echo "   - SMTP: localhost:1025"
    echo ""
    echo "🔧 현재 환경변수 설정:"
    echo "   SMTP_HOST=${SMTP_HOST}"
    echo "   SMTP_PORT=${SMTP_PORT}"
    echo "   SMTP_USER=${SMTP_USER}"
    echo "   SMTP_PASS=${SMTP_PASS}"
    echo "   FROM_EMAIL=${FROM_EMAIL}"
    echo ""
    echo "💡 사용법:"
    echo "   1. 애플리케이션에서 이메일 발송"
    echo "   2. http://localhost:8025 에서 받은 이메일 확인"
else
    echo "❌ MailHog 시작에 실패했습니다."
    echo "   docker-compose logs mailhog 명령으로 로그를 확인하세요."
    exit 1
fi
