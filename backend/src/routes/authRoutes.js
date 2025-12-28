import { Router } from "express";
import {
  registerTenant,
  login,
  me,
  logout
} from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.post("/register-tenant", registerTenant);
router.post("/login", login);
router.get("/me", auth, me);
router.post("/logout", auth, logout);

export default router;
