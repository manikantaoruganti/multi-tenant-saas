CREATE EXTENSION IF NOT EXISTS "pgcrypto";

INSERT INTO users (
  id, tenant_id, email, password_hash, full_name, role, is_active
) VALUES (
  gen_random_uuid(),
  NULL,
  'superadmin@system.com',
  '$2b$10$pi2tmdUWuWqidZ0yHtnHkuf5hNdlgrwSlVknFwy4M1t91ueMy5Z3W',
  'System Super Admin',
  'super_admin',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO tenants (
  id, name, subdomain, status, subscription_plan, max_users, max_projects
) VALUES (
  gen_random_uuid(),
  'Demo Company',
  'demo',
  'active',
  'pro',
  25,
  15
) ON CONFLICT (subdomain) DO NOTHING;

INSERT INTO users (
  id, tenant_id, email, password_hash, full_name, role, is_active
)
SELECT
  gen_random_uuid(),
  t.id,
  'admin@demo.com',
  '$2b$10$pi2tmdUWuWqidZ0yHtnHkuf5hNdlgrwSlVknFwy4M1t91ueMy5Z3W',
  'Demo Admin',
  'tenant_admin',
  true
FROM tenants t
WHERE t.subdomain = 'demo'
ON CONFLICT DO NOTHING;

INSERT INTO users (
  id, tenant_id, email, password_hash, full_name, role, is_active
)
SELECT gen_random_uuid(), t.id, 'user1@demo.com',
'$2b$10$pi2tmdUWuWqidZ0yHtnHkuf5hNdlgrwSlVknFwy4M1t91ueMy5Z3W',
'Demo User One', 'user', true
FROM tenants t WHERE t.subdomain='demo'
ON CONFLICT DO NOTHING;

INSERT INTO users (
  id, tenant_id, email, password_hash, full_name, role, is_active
)
SELECT gen_random_uuid(), t.id, 'user2@demo.com',
'$2b$10$pi2tmdUWuWqidZ0yHtnHkuf5hNdlgrwSlVknFwy4M1t91ueMy5Z3W',
'Demo User Two', 'user', true
FROM tenants t WHERE t.subdomain='demo'
ON CONFLICT DO NOTHING;
