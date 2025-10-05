#!/bin/bash

# MinIO 버킷 정책 설정 스크립트

echo "Setting up MinIO bucket policy..."

# MinIO 클라이언트 설치 (macOS)
if ! command -v mc &> /dev/null; then
    echo "Installing MinIO client..."
    brew install minio/stable/mc
fi

# MinIO 서버 설정
mc alias set local http://localhost:9000 minio_admin admin_password

# 버킷 생성 (이미 있으면 무시)
mc mb local/local-assets-1 --ignore-existing

# 공개 읽기 정책 설정
mc anonymous set download local/local-assets-1/uploads

echo "MinIO setup completed!"
echo "Bucket: local-assets-1"
echo "Public read access enabled for uploads/ folder"
