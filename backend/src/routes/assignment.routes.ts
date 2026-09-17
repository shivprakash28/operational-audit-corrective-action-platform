import { Router } from "express";
import {
  assignAuditor,
  getAssignments,
} from "../controllers/assignment.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/:auditId/assign",
  authenticate,
  authorize("ADMIN", "AUDITOR"),
  assignAuditor
);

router.get(
  "/:auditId/assignments",
  authenticate,
  authorize("ADMIN", "AUDITOR", "DEPARTMENT_OWNER", "MANAGEMENT"),
  getAssignments
);

export default router;