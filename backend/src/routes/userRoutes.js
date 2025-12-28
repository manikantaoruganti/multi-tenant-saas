import { Router } from "express";
import auth from "../middleware/auth.js";
import tenantIsolation from "../middleware/tenant.js";
import {
  createUser,
  listUsers,
  updateUser,
  deleteUser
} from "../controllers/userController.js";

const router = Router();

router.use(auth);

router.post("/tenants/:tenantId/users", tenantIsolation, createUser);
router.get("/tenants/:tenantId/users", tenantIsolation, listUsers);
router.put("/users/:userId", tenantIsolation, updateUser);
router.delete("/users/:userId", tenantIsolation, deleteUser);

export default router;
