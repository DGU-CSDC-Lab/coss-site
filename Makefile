.PHONY: help dev up down build clean logs test install db-setup lint format build-prod up-prod down-prod logs-prod

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	cd web && npm install
	cd server && npm install
	npm install

start: ## Start development environment
	cd web && npm run dev
	cd server && npm run start

dev: ## Start development environment
	docker-compose up --build

up: ## Start containers
	docker-compose up -d

down: ## Stop containers
	docker-compose down

build: ## Build containers
	docker-compose build

clean: ## Clean containers and volumes
	docker-compose down -v --remove-orphans
	docker system prune -f

logs: ## Show logs
	docker-compose logs -f

logs-web: ## Show web logs
	docker-compose logs -f web

logs-server: ## Show server logs
	docker-compose logs -f server

logs-db: ## Show database logs
	docker-compose logs -f mariadb

test: ## Run tests
	cd server && npm test
	cd web && npm test

test-server: ## Run server tests
	cd server && npm test

test-web: ## Run web tests
	cd web && npm test

lint: ## Run linting for all projects
	cd server && npm run lint
	cd web && npm run lint

lint-fix: ## Fix linting issues for all projects
	cd server && npm run lint
	cd web && npm run lint:fix

format: ## Format code for all projects
	cd server && npm run format
	cd web && npm run format

format-check: ## Check code formatting for all projects
	cd server && npm run format:check
	cd web && npm run format:check

db-setup: ## Setup database manually
	docker-compose exec mariadb mysql -u root -proot iot_site < /docker-entrypoint-initdb.d/setup-db.sql

db-shell: ## Access database shell
	docker-compose exec mariadb mysql -u iot_user -piot_password iot_site