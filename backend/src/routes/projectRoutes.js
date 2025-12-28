import { Router } from "express";
import auth from "../middleware/auth.js";
import tenantIsolation from "../middleware/tenant.js";
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject
} from "../controllers/projectController.js";

const router = Router();

router.use(auth, tenantIsolation);

router.post("/projects", createProject);
router.get("/projects", listProjects);
router.get("/projects/:projectId", getProject);
router.put("/projects/:projectId", updateProject);
router.delete("/projects/:projectId", deleteProject);

export default router;
