.PHONY: help install start dev clean logs-web logs-server logs-db test test-server test-web lint lint-fix format format-check db-setup

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Dependencies
install: ## Install dependencies
	cd web && npm install
	cd server && npm install
	cp server/.env.example server/.env.local
	cp web/.env.example web/.env.local

# Build and Runs
start:
	@echo "Starting local environment..."
	@scripts/check-compose.sh || (echo "❌ Service check failed" && exit 1)
	@scripts/create-minio-bucket.sh || (echo "❌ MinIO setup failed" && exit 1)
	@echo "✅ All services ready, starting development servers..."
	@echo "🚀 Starting API server in background..."
	@(cd server && nohup npm run start:dev > server.log 2>&1 &)
	@sleep 6
	@echo "📄 Run 'make logs' in a separate terminal to follow server logs."
	@echo ""
	@echo "🚀 Starting web server (foreground)..."
	@cd web && npm run dev

logs:
	@tail -f server/server.log

stop: ## Stop all running development servers
	@echo "Stopping development servers..."
	@pkill -f "npm run start:dev" || echo "No server process found"
	@pkill -f "npm run dev" || echo "No web process found"
	@pkill -f "node.*nest start" || echo "No nest process found"
	@rm -f server/server.log || echo "No log file to remove"
	@echo "✅ All processes stopped"

# Clean up
stop: ## Clean containers and volumes
	docker-compose -f docker-compose.local.yml down -v --remove-orphans

# Clean up
clean: ## Clean containers and volumes
	@bash cd server && rm -rf dist node_modules/.cache
	@bash cd web && rm -rf dist node_modules/.cache
	docker stop coss-mariadb || echo "No database container to stop"
	docker rm coss-mariadb || echo "No database container to remove"
	docker volume rm coss-mariadb-data || echo "No database volume to remove"
	docker stop coss-minio || echo "No MinIO container to stop"
	docker rm coss-minio || echo "No MinIO container to remove"
	docker volume rm coss-minio || echo "No MinIO volume to remove"
	docker stop coss-mailhog || echo "No MailHog container to stop"
	docker rm coss-mailhog || echo "No MailHog container to remove"
	docker ps
	docker volume prune -f || echo "No dangling images to remove"
	@echo "✅ Cleaned up containers, volumes, and build artifacts"

# Logs
logs-web: ## Show web logs
	docker-compose logs -f web

logs-server: ## Show server logs
	docker-compose logs -f server

logs-db: ## Show database logs
	docker-compose logs -f mariadb

# Tests
test: ## Run tests
	cd server && npm test
	cd web && npm test

test-server: ## Run server tests
	cd server && npm test

test-web: ## Run web tests
	cd web && npm test

# Builds
build: ## Run builds
	cd server && npm run build
	cd web && npm run build

# Lints
lint: ## Run linting for all projects
	cd server && npm run lint
	cd web && npm run lint

lint-fix: ## Fix linting issues for all projects
	cd server && npm run lint
	cd web && npm run lint:fix

# Formats
format: ## Format code for all projects
	cd server && npm run format
	cd web && npm run format

format-check: ## Check code formatting for all projects
	cd server && npm run format:check
	cd web && npm run format:check

db-setup: ## Setup database manually
	scripts/check-mariadb.sh