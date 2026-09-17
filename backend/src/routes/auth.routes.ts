import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import {
  authenticate,
  authorize,
  AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get(
  "/profile",
  authenticate,
  authorize("ADMIN", "AUDITOR", "DEPARTMENT_OWNER", "MANAGEMENT"),
  (req: AuthRequest, res) => {
    res.json({
      message: "Protected route accessed successfully",
      user: req.user,
    });
  }
);

export default router;