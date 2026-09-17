import { Router } from "express";
import {
  createFinding,
  getFindings,
  getFindingById,
  updateFinding,
} from "../controllers/finding.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/observations/:observationId/finding",
  authenticate,
  authorize("ADMIN", "AUDITOR"),
  createFinding
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "AUDITOR", "DEPARTMENT_OWNER", "MANAGEMENT"),
  getFindings
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "AUDITOR", "DEPARTMENT_OWNER", "MANAGEMENT"),
  getFindingById
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "AUDITOR", "DEPARTMENT_OWNER"),
  updateFinding
);

export default router;