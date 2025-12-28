import { Router } from "express";
import auth from "../middleware/auth.js";
import tenantIsolation from "../middleware/tenant.js";
import {
  listTenants,
  getTenant,
  updateTenant
} from "../controllers/tenantController.js";

const router = Router();

router.use(auth);

router.get("/", listTenants);
router.get("/:tenantId", tenantIsolation, getTenant);
router.put("/:tenantId", tenantIsolation, updateTenant);

export default router;
