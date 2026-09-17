import { Router } from "express";
import {
  createChecklistTemplate,
  createChecklistItem,
  assignChecklist,
  getAuditChecklist,
  submitChecklistResponse,
} from "../controllers/checklist.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/templates",
  authenticate,
  authorize("ADMIN", "AUDITOR"),
  createChecklistTemplate
);

router.post(
  "/templates/:templateId/items",
  authenticate,
  authorize("ADMIN", "AUDITOR"),
  createChecklistItem
);

router.post(
  "/:auditId/assign-checklist",
  authenticate,
  authorize("ADMIN", "AUDITOR"),
  assignChecklist
);

router.get(
  "/:auditId",
  authenticate,
  authorize("ADMIN", "AUDITOR", "DEPARTMENT_OWNER", "MANAGEMENT"),
  getAuditChecklist
);

router.post(
  "/:auditChecklistId/responses",
  authenticate,
  authorize("ADMIN", "AUDITOR"),
  submitChecklistResponse
);

export default router;