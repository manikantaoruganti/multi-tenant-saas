# Product Requirements Document

## Objective

Build a secure multi-tenant SaaS platform for managing projects and tasks.

## User Roles

Super Admin
- Manages all tenants

Tenant Admin
- Manages users and projects within a tenant

User
- Works on assigned tasks

## Functional Requirements

1. The system shall support tenant-based login.
2. The system shall isolate tenant data.
3. The system shall use JWT authentication.
4. The system shall support role-based access.
5. The system shall allow project creation.
6. The system shall allow task creation and updates.
7. The system shall enforce subscription limits.

## Non-Functional Requirements

1. Secure password storage
2. Scalable database design
3. Reliable API responses
4. Docker-based deployment
5. Maintainable code structure
