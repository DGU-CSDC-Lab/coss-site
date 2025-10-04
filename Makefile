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

# Build and Runs
start: ## Start development environment
	scripts/check-mariadb.sh
	cd web && npm run dev
	cd server && npm run start

dev: ## Start development environment
	docker-compose up --build
	docker-compose up

# Clean up
clean: ## Clean containers and volumes
	docker-compose down -v --remove-orphans
	docker system prune -f

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