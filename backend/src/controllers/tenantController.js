import pool from "../db.js";

/**
 * GET /api/tenants
 * super_admin only
 */
export async function listTenants(req, res, next) {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied"
    });
  }

  try {
    const result = await pool.query(`
      SELECT
        t.id,
        t.name,
        t.subdomain,
        t.status,
        t.subscription_plan,
        t.created_at,
        COUNT(DISTINCT u.id) AS total_users,
        COUNT(DISTINCT p.id) AS total_projects
      FROM tenants t
      LEFT JOIN users u ON u.tenant_id = t.id
      LEFT JOIN projects p ON p.tenant_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/tenants/:tenantId
 * tenant_admin (own tenant) OR super_admin
 */
export async function getTenant(req, res, next) {
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
      SELECT
        t.id,
        t.name,
        t.subdomain,
        t.status,
        t.subscription_plan,
        t.max_users,
        t.max_projects,
        COUNT(DISTINCT u.id) AS total_users,
        COUNT(DISTINCT p.id) AS total_projects,
        COUNT(DISTINCT tk.id) AS total_tasks
      FROM tenants t
      LEFT JOIN users u ON u.tenant_id = t.id
      LEFT JOIN projects p ON p.tenant_id = t.id
      LEFT JOIN tasks tk ON tk.tenant_id = t.id
      WHERE t.id = $1
      GROUP BY t.id
      `,
      [tenantId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found"
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/tenants/:tenantId
 * tenant_admin → can update name only
 * super_admin → can update everything
 */
export async function updateTenant(req, res, next) {
  const { tenantId } = req.params;
  const {
    name,
    status,
    subscriptionPlan,
    maxUsers,
    maxProjects
  } = req.body;

  try {
    const fields = [];
    const values = [];
    let index = 1;

    // tenant_admin restriction
    if (req.user.role === "tenant_admin") {
      if (!name) {
        return res.status(403).json({
          success: false,
          message: "Tenant admin can only update name"
        });
      }
      fields.push(`name = $${index++}`);
      values.push(name);
    }

    // super_admin full access
    if (req.user.role === "super_admin") {
      if (name) {
        fields.push(`name = $${index++}`);
        values.push(name);
      }
      if (status) {
        fields.push(`status = $${index++}`);
        values.push(status);
      }
      if (subscriptionPlan) {
        fields.push(`subscription_plan = $${index++}`);
        values.push(subscriptionPlan);
      }
      if (maxUsers) {
        fields.push(`max_users = $${index++}`);
        values.push(maxUsers);
      }
      if (maxProjects) {
        fields.push(`max_projects = $${index++}`);
        values.push(maxProjects);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update"
      });
    }

    values.push(tenantId);

    const result = await pool.query(
      `
      UPDATE tenants
      SET ${fields.join(", ")}, updated_at = NOW()
      WHERE id = $${index}
      RETURNING id, name, status, subscription_plan
      `,
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found"
      });
    }

    res.json({
      success: true,
      message: "Tenant updated successfully",
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}
