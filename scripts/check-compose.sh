#!/bin/bash

# local 개발을 위해 필요한 db(mariadb), minio, mailhog가 실행중인지 확인하고, 실행중이지 않다면 docker-compose로 실행시키는 script입니다.
# make start 시 함께 수행됩니다. (따로 실행할 필요 없음)
echo "Checking local environment..."

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "docker-compose not found. Please install docker-compose."
    exit 1
fi

# Check if services are already running
MARIADB_RUNNING=$(docker ps --filter "name=coss-mariadb" --filter "status=running" --format "{{.Names}}" | grep -c "coss-mariadb")
MINIO_RUNNING=$(docker ps --filter "name=coss-minio" --filter "status=running" --format "{{.Names}}" | grep -c "coss-minio")
MAILHOG_RUNNING=$(docker ps --filter "name=coss-mailhog" --filter "status=running" --format "{{.Names}}" | grep -c "coss-mailhog")

if [ "$MARIADB_RUNNING" -eq 1 ] && [ "$MINIO_RUNNING" -eq 1 ] && [ "$MAILHOG_RUNNING" -eq 1 ]; then
    echo "✅ All services are already running:"
elif [ "$MARIADB_RUNNING" -eq 1 ] || [ "$MINIO_RUNNING" -eq 1 ] || [ "$MAILHOG_RUNNING" -eq 1 ]; then
    echo "⚠️  Some services are running, starting missing services..."
    docker-compose -f docker-compose.local.yml up -d
    echo "✅ All services are now running:"
else
    echo "Starting local environment..."
    docker-compose -f docker-compose.local.yml up -d
    echo "✅ Services started:"
fi

echo "- MariaDB: localhost:3308"
echo "- MinIO API: http://localhost:9000"
echo "- MinIO Console: http://localhost:9001"
echo "- MailHog SMTP: localhost:1025"
echo "- MailHog Web UI: http://localhost:8025"
