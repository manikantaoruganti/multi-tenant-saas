import { Router } from "express";
import auth from "../middleware/auth.js";
import tenantIsolation from "../middleware/tenant.js";
import {
  createTask,
  listTasks,
  updateTask,
  deleteTask
} from "../controllers/taskController.js";

const router = Router();

router.use(auth, tenantIsolation);

router.post("/projects/:projectId/tasks", createTask);
router.get("/projects/:projectId/tasks", listTasks);
router.put("/tasks/:taskId", updateTask);
router.delete("/tasks/:taskId", deleteTask);

export default router;
