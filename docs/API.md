# API Documentation

All APIs return a consistent JSON response format.

success: boolean
message: string (optional)
data: object

## Authentication

POST /api/auth/login

Request:
email
password
tenantSubdomain

## Tenants

GET /api/tenants

## Users

POST /api/users

## Projects

GET /api/projects
POST /api/projects

## Tasks

GET /api/projects/:projectId/tasks
POST /api/projects/:projectId/tasks
