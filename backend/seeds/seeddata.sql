-- =========================================================
-- EXTENSIONS (required for UUID generation)
-- =========================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- SUPER ADMIN (tenant_id = NULL)
-- =========================================================
INSERT INTO users (
  id,
  tenant_id,
  email,
  password_hash,
  full_name,
  role,
  is_active
)
VALUES (
  gen_random_uuid(),
  NULL,
  'superadmin@system.com',
  '$2b$10$wzQwU8N9bL1m0JgZP7Fz0uH9Wk3pFzF8Q1s3J0M0z2ZP9P3bZQn9G',
  'System Super Admin',
  'super_admin',
  true
)
ON CONFLICT (email) DO NOTHING;

-- =========================================================
-- TENANT: DEMO COMPANY
-- =========================================================
INSERT INTO tenants (
  id,
  name,
  subdomain,
  status,
  subscription_plan,
  max_users,
  max_projects
)
VALUES (
  gen_random_uuid(),
  'Demo Company',
  'demo',
  'active',
  'pro',
  25,
  15
)
ON CONFLICT (subdomain) DO NOTHING;

-- =========================================================
-- TENANT ADMIN
-- =========================================================
INSERT INTO users (
  id,
  tenant_id,
  email,
  password_hash,
  full_name,
  role,
  is_active
)
SELECT
  gen_random_uuid(),
  t.id,
  'admin@demo.com',
  '$2b$10$A8xvs1W7r3Pw3w0dHWMjVOz57QjxelTwRY93V5aJjia66ac6BWdsS'
  'Demo Admin',
  'tenant_admin',
  true
FROM tenants t
WHERE t.subdomain = 'demo'
ON CONFLICT (email) DO NOTHING;

-- =========================================================
-- REGULAR USERS
-- =========================================================
INSERT INTO users (
  id,
  tenant_id,
  email,
  password_hash,
  full_name,
  role,
  is_active
)
SELECT
  gen_random_uuid(),
  t.id,
  'user1@demo.com',
  '$2b$10$A8xvs1W7r3Pw3w0dHWMjVOz57QjxelTwRY93V5aJjia66ac6BWdsS',
  'Demo User One',
  'user',
  true
FROM tenants t
WHERE t.subdomain = 'demo'
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (
  id,
  tenant_id,
  email,
  password_hash,
  full_name,
  role,
  is_active
)
SELECT
  gen_random_uuid(),
  t.id,
  'user2@demo.com',
  '$2b$10$A8xvs1W7r3Pw3w0dHWMjVOz57QjxelTwRY93V5aJjia66ac6BWdsS',
  'Demo User Two',
  'user',
  true
FROM tenants t
WHERE t.subdomain = 'demo'
ON CONFLICT (email) DO NOTHING;

-- =========================================================
-- PROJECTS
-- =========================================================
INSERT INTO projects (
  id,
  tenant_id,
  name,
  description,
  created_by
)
SELECT
  gen_random_uuid(),
  t.id,
  'Project Alpha',
  'Initial demo project',
  u.id
FROM tenants t
JOIN users u ON u.email = 'admin@demo.com'
WHERE t.subdomain = 'demo'
ON CONFLICT DO NOTHING;

INSERT INTO projects (
  id,
  tenant_id,
  name,
  description,
  created_by
)
SELECT
  gen_random_uuid(),
  t.id,
  'Project Beta',
  'Second demo project',
  u.id
FROM tenants t
JOIN users u ON u.email = 'admin@demo.com'
WHERE t.subdomain = 'demo'
ON CONFLICT DO NOTHING;

-- =========================================================
-- TASKS
-- =========================================================
INSERT INTO tasks (
  id,
  project_id,
  tenant_id,
  title,
  description,
  status,
  priority,
  assigned_to
)
SELECT
  gen_random_uuid(),
  p.id,
  p.tenant_id,
  'Design UI',
  'Create initial UI mockups',
  'todo',
  'high',
  u.id
FROM projects p
JOIN users u ON u.email = 'user1@demo.com'
WHERE p.name = 'Project Alpha'
ON CONFLICT DO NOTHING;

INSERT INTO tasks (
  id,
  project_id,
  tenant_id,
  title,
  description,
  status,
  priority,
  assigned_to
)
SELECT
  gen_random_uuid(),
  p.id,
  p.tenant_id,
  'API Integration',
  'Integrate backend APIs',
  'in_progress',
  'medium',
  u.id
FROM projects p
JOIN users u ON u.email = 'user2@demo.com'
WHERE p.name = 'Project Alpha'
ON CONFLICT DO NOTHING;

-- =========================================================
-- AUDIT LOG (OPTIONAL BUT GOOD PRACTICE)
-- =========================================================
INSERT INTO audit_logs (
  id,
  tenant_id,
  user_id,
  action,
  entity_type,
  entity_id
)
SELECT
  gen_random_uuid(),
  t.id,
  u.id,
  'SEED_DATA_INIT',
  'system',
  NULL
FROM tenants t
JOIN users u ON u.email = 'admin@demo.com'
WHERE t.subdomain = 'demo'
ON CONFLICT DO NOTHING;
