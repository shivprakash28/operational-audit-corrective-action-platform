import { Router } from "express";
import {
  createAudit,
  getAudits,
  getAuditById,
  updateAudit,
} from "../controllers/audit.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "AUDITOR"),
  createAudit
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "AUDITOR", "DEPARTMENT_OWNER", "MANAGEMENT"),
  getAudits
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "AUDITOR", "DEPARTMENT_OWNER", "MANAGEMENT"),
  getAuditById
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "AUDITOR"),
  updateAudit
);

export default router;