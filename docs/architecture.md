# System Architecture

Frontend (React)
Backend (Express API)
Database (PostgreSQL)

## Architecture Pattern

Shared database
Shared schema
Tenant isolation using tenant_id

## Security

JWT authentication
Role-based authorization
Password hashing
Tenant-level query filtering

## Request Flow

User logs in
JWT token issued
Token attached to API requests
Backend validates token
Tenant scope enforced
