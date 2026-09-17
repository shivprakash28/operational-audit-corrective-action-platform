import { Router } from "express";
import {
  createObservation,
  getObservations,
  getObservationById,
} from "../controllers/observation.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/audits/:auditId",
  authenticate,
  authorize("ADMIN", "AUDITOR"),
  createObservation
);

router.get(
  "/audits/:auditId",
  authenticate,
  authorize("ADMIN", "AUDITOR", "DEPARTMENT_OWNER", "MANAGEMENT"),
  getObservations
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "AUDITOR", "DEPARTMENT_OWNER", "MANAGEMENT"),
  getObservationById
);

export default router;