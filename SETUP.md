# Setup Guide

## Prerequisites

- Docker
- Docker Compose
- Git

## Run Application

From the project root directory:

docker-compose up -d

## Verify

Frontend:
http://localhost:3000

Backend Health:
http://localhost:5000/api/health

Expected response:
status: ok
database: connected

## Stop Application

docker-compose down
