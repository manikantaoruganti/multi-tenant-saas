import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";

export async function login(req, res, next) {
  const { email, password, tenantSubdomain } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    let tenantId = null;

    if (!tenantSubdomain) {
      const superAdmin = await pool.query(
        `SELECT id, email, password_hash, full_name, role FROM users WHERE email = $1 AND tenant_id IS NULL AND role = 'super_admin' AND is_active = true`,
        [email]
      );

      if (superAdmin.rowCount === 0) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      const user = superAdmin.rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });

      return res.json({
        success: true,
        token,
        user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role }
      });
    }

    const tenantResult = await pool.query("SELECT id, status FROM tenants WHERE subdomain = $1", [tenantSubdomain]);

    if (tenantResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    if (tenantResult.rows[0].status !== "active") {
      return res.status(403).json({ success: false, message: "Tenant inactive" });
    }

    tenantId = tenantResult.rows[0].id;

    const userResult = await pool.query(
      `SELECT id, email, password_hash, full_name, role FROM users WHERE email = $1 AND tenant_id = $2 AND is_active = true`,
      [email, tenantId]
    );

    if (userResult.rowCount === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = userResult.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, tenantId, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role, tenantId }
    });
  } catch (err) {
    next(err);
  }
}