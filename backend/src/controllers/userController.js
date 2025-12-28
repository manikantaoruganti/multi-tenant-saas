import bcrypt from "bcrypt";
import pool from "../db.js";

/**
 * POST /api/tenants/:tenantId/users
 * tenant_admin only
 */
export async function createUser(req, res, next) {
  const { tenantId } = req.params;
  const { email, password, fullName, role = "user" } = req.body;

  if (req.user.role !== "tenant_admin" || req.user.tenantId !== tenantId) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized"
    });
  }

  if (!email || !password || !fullName) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  try {
    // get tenant limits
    const tenantRes = await pool.query(
      "SELECT max_users FROM tenants WHERE id = $1",
      [tenantId]
    );

    const maxUsers = tenantRes.rows[0].max_users;

    const countRes = await pool.query(
      "SELECT COUNT(*) FROM users WHERE tenant_id = $1",
      [tenantId]
    );

    if (Number(countRes.rows[0].count) >= maxUsers) {
      return res.status(403).json({
        success: false,
        message: "Subscription user limit reached"
      });
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE tenant_id = $1 AND email = $2",
      [tenantId, email]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists in this tenant"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (tenant_id, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, full_name, role, is_active, created_at
      `,
      [tenantId, email, hash, fullName, role]
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/tenants/:tenantId/users
 */
export async function listUsers(req, res, next) {
  const { tenantId } = req.params;

  if (
    req.user.role !== "super_admin" &&
    req.user.tenantId !== tenantId
  ) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized"
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT id, email, full_name, role, is_active, created_at
      FROM users
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      `,
      [tenantId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/users/:userId
 */
export async function updateUser(req, res, next) {
  const { userId } = req.params;
  const { fullName, role, isActive } = req.body;

  try {
    const userRes = await pool.query(
      "SELECT tenant_id FROM users WHERE id = $1",
      [userId]
    );

    if (userRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const tenantId = userRes.rows[0].tenant_id;

    if (
      req.user.role !== "tenant_admin" ||
      req.user.tenantId !== tenantId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const updates = [];
    const values = [];
    let i = 1;

    if (fullName) {
      updates.push(`full_name = $${i++}`);
      values.push(fullName);
    }

    if (role) {
      updates.push(`role = $${i++}`);
      values.push(role);
    }

    if (typeof isActive === "boolean") {
      updates.push(`is_active = $${i++}`);
      values.push(isActive);
    }

    values.push(userId);

    const result = await pool.query(
      `
      UPDATE users
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE id = $${i}
      RETURNING id, email, full_name, role, is_active
      `,
      values
    );

    res.json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/users/:userId
 */
export async function deleteUser(req, res, next) {
  const { userId } = req.params;

  try {
    if (req.user.userId === userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete yourself"
      });
    }

    const userRes = await pool.query(
      "SELECT tenant_id FROM users WHERE id = $1",
      [userId]
    );

    if (userRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (
      req.user.role !== "tenant_admin" ||
      req.user.tenantId !== userRes.rows[0].tenant_id
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // unassign tasks
    await pool.query(
      "UPDATE tasks SET assigned_to = NULL WHERE assigned_to = $1",
      [userId]
    );

    await pool.query(
      "DELETE FROM users WHERE id = $1",
      [userId]
    );

    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (err) {
    next(err);
  }
}
