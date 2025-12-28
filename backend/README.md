# Multi-Tenant SaaS Platform

This project is a production-ready Multi-Tenant SaaS application.
It allows multiple organizations (tenants) to manage users, projects,
and tasks with complete data isolation.

## Quick Start

docker-compose up -d

## Services and Ports

Frontend  : http://localhost:3000  
Backend   : http://localhost:5000  
Database  : PostgreSQL on port 5432  

## Features

- Multi-tenant architecture with tenant isolation
- JWT-based authentication
- Role-Based Access Control (RBAC)
- Project and Task management
- Automatic database migrations and seed data
- Dockerized full-stack setup
- RESTful API backend

## Health Check

http://localhost:5000/api/health

## Documentation

All documentation is available inside the docs folder.

## Test Credentials

Check submission.json for demo login details.
