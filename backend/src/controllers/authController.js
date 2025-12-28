import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";

/**
 * POST /api/auth/register-tenant
 */
export async function registerTenant(req, res, next) {
  const {
    tenantName,
    subdomain,
    adminEmail,
    adminPassword,
    adminFullName
  } = req.body;

  if (!tenantName || !subdomain || !adminEmail || !adminPassword || !adminFullName) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check subdomain uniqueness
    const existingTenant = await client.query(
      "SELECT id FROM tenants WHERE subdomain = $1",
      [subdomain]
    );
    if (existingTenant.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Subdomain already exists"
      });
    }

    // Create tenant (default: free plan)
    const tenantResult = await client.query(
      `INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects)
       VALUES ($1, $2, 'active', 'free', 5, 3)
       RETURNING id, name, subdomain`,
      [tenantName, subdomain]
    );

    const tenant = tenantResult.rows[0];

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Create tenant admin
    const userResult = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, 'tenant_admin')
       RETURNING id, email, full_name, role`,
      [tenant.id, adminEmail, passwordHash, adminFullName]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Tenant registered successfully",
      data: {
        tenantId: tenant.id,
        subdomain: tenant.subdomain,
        adminUser: userResult.rows[0]
      }
    });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  const { email, password, tenantSubdomain } = req.body;

  if (!email || !password || !tenantSubdomain) {
    return res.status(400).json({
      success: false,
      message: "Email, password and tenant subdomain are required"
    });
  }

  try {
    const tenantResult = await pool.query(
      "SELECT id, status FROM tenants WHERE subdomain = $1",
      [tenantSubdomain]
    );

    if (tenantResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found"
      });
    }

    const tenant = tenantResult.rows[0];
    if (tenant.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Tenant is not active"
      });
    }

    const userResult = await pool.query(
      `SELECT id, email, password_hash, full_name, role
       FROM users
       WHERE email = $1 AND tenant_id = $2 AND is_active = true`,
      [email, tenant.id]
    );

    if (userResult.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const user = userResult.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: tenant.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: tenant.id
        },
        token,
        expiresIn: 86400
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 */
export async function me(req, res, next) {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.role, u.is_active,
              t.id AS tenant_id, t.name, t.subdomain,
              t.subscription_plan, t.max_users, t.max_projects
       FROM users u
       LEFT JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const row = result.rows[0];

    res.json({
      success: true,
      data: {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        role: row.role,
        isActive: row.is_active,
        tenant: row.tenant_id
          ? {
              id: row.tenant_id,
              name: row.name,
              subdomain: row.subdomain,
              subscriptionPlan: row.subscription_plan,
              maxUsers: row.max_users,
              maxProjects: row.max_projects
            }
          : null
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req, res) {
  res.json({
    success: true,
    message: "Logged out successfully"
  });
}
