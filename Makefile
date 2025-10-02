.PHONY: help up dev db-only server-local web-local down lint test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start all containers (docker-compose up)
	docker-compose up --build

dev: ## Start development environment with hot reload
	docker-compose -f docker-compose.dev.yml up --build

db-only: ## Start only database container
	docker-compose up -d mariadb

server-local: ## Start server locally with npm
	cd server && npm run start:dev

web-local: ## Start web locally with npm
	cd web && npm run dev

down: ## Stop all containers
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

lint: ## Run linting for all projects
	cd server && npm run lint
	cd web && npm run lint

test: ## Run tests for all projects
	cd server && npm test
	cd web && npm test
