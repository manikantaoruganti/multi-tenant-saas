import pool from "../db.js";

/**
 * POST /api/projects
 * tenant_admin OR user
 */
export async function createProject(req, res, next) {
  const { name, description } = req.body;
  const tenantId = req.user.tenantId;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Project name is required"
    });
  }

  try {
    // get tenant project limit
    const limitRes = await pool.query(
      "SELECT max_projects FROM tenants WHERE id = $1",
      [tenantId]
    );

    const maxProjects = limitRes.rows[0].max_projects;

    const countRes = await pool.query(
      "SELECT COUNT(*) FROM projects WHERE tenant_id = $1",
      [tenantId]
    );

    if (Number(countRes.rows[0].count) >= maxProjects) {
      return res.status(403).json({
        success: false,
        message: "Project limit reached for this subscription"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO projects (tenant_id, name, description, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, description, created_at
      `,
      [tenantId, name, description || null, req.user.userId]
    );

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/projects
 */
export async function listProjects(req, res, next) {
  const tenantId = req.user.tenantId;

  try {
    const result = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.created_at,
        COUNT(t.id) AS total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS completed_tasks
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE p.tenant_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC
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
 * GET /api/projects/:projectId
 */
export async function getProject(req, res, next) {
  const { projectId } = req.params;
  const tenantId = req.user.tenantId;

  try {
    const result = await pool.query(
      `
      SELECT id, name, description, created_at
      FROM projects
      WHERE id = $1 AND tenant_id = $2
      `,
      [projectId, tenantId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
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
 * PUT /api/projects/:projectId
 */
export async function updateProject(req, res, next) {
  const { projectId } = req.params;
  const { name, description } = req.body;
  const tenantId = req.user.tenantId;

  if (!name && !description) {
    return res.status(400).json({
      success: false,
      message: "Nothing to update"
    });
  }

  try {
    const result = await pool.query(
      `
      UPDATE projects
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        updated_at = NOW()
      WHERE id = $3 AND tenant_id = $4
      RETURNING id, name, description
      `,
      [name || null, description || null, projectId, tenantId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.json({
      success: true,
      message: "Project updated successfully",
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/projects/:projectId
 * tenant_admin only
 */
export async function deleteProject(req, res, next) {
  const { projectId } = req.params;
  const tenantId = req.user.tenantId;

  if (req.user.role !== "tenant_admin") {
    return res.status(403).json({
      success: false,
      message: "Only tenant admin can delete projects"
    });
  }

  try {
    await pool.query("DELETE FROM tasks WHERE project_id = $1", [projectId]);

    const result = await pool.query(
      "DELETE FROM projects WHERE id = $1 AND tenant_id = $2",
      [projectId, tenantId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.json({
      success: true,
      message: "Project deleted successfully"
    });
  } catch (err) {
    next(err);
  }
}
