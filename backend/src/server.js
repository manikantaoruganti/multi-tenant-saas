import express from "express";
import cors from "cors";
import pool from "./db.js";

import authRoutes from "./routes/authRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

import errorHandler from "./middleware/errorHandler.js";

const app = express();

/* ---------- Middleware ---------- */
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
app.use(express.json());

/* ---------- Health Check ---------- */
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      status: "ok",
      database: "connected"
    });
  } catch (err) {
    console.error("❌ DB Health Check Failed", err);
    res.status(500).json({
      status: "error",
      database: "disconnected"
    });
  }
});

/* ---------- Routes ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

/* ---------- Error Handler ---------- */
app.use(errorHandler);

/* ---------- Server ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
