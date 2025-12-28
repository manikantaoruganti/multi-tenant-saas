import pool from "../db.js";

/**
 * POST /api/projects/:projectId/tasks
 */
export async function createTask(req, res, next) {
  const { projectId } = req.params;
  const { title, description, priority, assignedTo, dueDate } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Task title is required"
    });
  }

  try {
    // validate project + tenant
    const projectRes = await pool.query(
      "SELECT tenant_id FROM projects WHERE id = $1",
      [projectId]
    );

    if (projectRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const projectTenantId = projectRes.rows[0].tenant_id;

    if (projectTenantId !== req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized project access"
      });
    }

    // validate assigned user (same tenant)
    if (assignedTo) {
      const userRes = await pool.query(
        "SELECT id FROM users WHERE id = $1 AND tenant_id = $2",
        [assignedTo, projectTenantId]
      );

      if (userRes.rowCount === 0) {
        return res.status(400).json({
          success: false,
          message: "Assigned user must belong to same tenant"
        });
      }
    }

    const result = await pool.query(
      `
      INSERT INTO tasks
      (project_id, tenant_id, title, description, priority, assigned_to, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, title, status, priority, due_date, created_at
      `,
      [
        projectId,
        projectTenantId,
        title,
        description || null,
        priority || "medium",
        assignedTo || null,
        dueDate || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/projects/:projectId/tasks
 */
export async function listTasks(req, res, next) {
  const { projectId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        u.full_name AS assigned_to
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assigned_to
      WHERE t.project_id = $1 AND t.tenant_id = $2
      ORDER BY t.created_at DESC
      `,
      [projectId, req.user.tenantId]
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
 * PUT /api/tasks/:taskId
 */
export async function updateTask(req, res, next) {
  const { taskId } = req.params;
  const { title, description, status, priority, assignedTo, dueDate } = req.body;

  try {
    // validate ownership
    const taskRes = await pool.query(
      "SELECT tenant_id FROM tasks WHERE id = $1",
      [taskId]
    );

    if (taskRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    if (taskRes.rows[0].tenant_id !== req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized task access"
      });
    }

    const result = await pool.query(
      `
      UPDATE tasks
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        assigned_to = $5,
        due_date = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING id, title, status, priority, updated_at
      `,
      [
        title || null,
        description || null,
        status || null,
        priority || null,
        assignedTo || null,
        dueDate || null,
        taskId
      ]
    );

    res.json({
      success: true,
      message: "Task updated successfully",
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/tasks/:taskId
 */
export async function deleteTask(req, res, next) {
  const { taskId } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND tenant_id = $2",
      [taskId, req.user.tenantId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.json({
      success: true,
      message: "Task deleted successfully"
    });
  } catch (err) {
    next(err);
  }
}
