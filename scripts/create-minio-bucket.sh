#!/bin/bash

# MinIO 버킷 생성 스크립트
# 로컬 개발 환경에서 S3 호환 스토리지인 MinIO에 버킷을 생성합니다.

# 스크립트 디렉토리와 프로젝트 루트 경로 설정 (상대 경로 에러 방지를 위해 절대 경로 사용)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/server/.env.local"

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

# 환경변수에서 MinIO 설정 가져오기 (이미 로드됨)

echo "Creating MinIO bucket: $BUCKET_NAME"

# AWS CLI 설치 여부 확인
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI first."
    exit 1
fi

# MinIO 접속을 위한 AWS 자격증명 설정 (.env.local에서 가져온 값 사용)
export AWS_ACCESS_KEY_ID=$MINIO_ACCESS_KEY
export AWS_SECRET_ACCESS_KEY=$MINIO_SECRET_KEY

# MinIO 버킷 생성 시도
BUCKET_ERROR=$(aws --endpoint-url=$MINIO_ENDPOINT s3 mb s3://$BUCKET_NAME 2>&1)
if [ $? -eq 0 ]; then
    echo "✅ Bucket '$BUCKET_NAME' created successfully"
else
    # 에러 종류에 따른 메시지 분기 처리
    if echo "$BUCKET_ERROR" | grep -q "BucketAlreadyExists\|BucketAlreadyOwnedByYou"; then
        echo "ℹ️  Bucket '$BUCKET_NAME' already exists"
    else
        echo "❌ Failed to create bucket: $BUCKET_ERROR"
    fi
fi

# 생성된 버킷 목록 확인
echo "Current buckets:"
LIST_ERROR=$(aws --endpoint-url=$MINIO_ENDPOINT s3 ls 2>&1)
if [ $? -eq 0 ]; then
    echo "$LIST_ERROR"
else
    echo "❌ Failed to connect to MinIO: $LIST_ERROR"
fi
