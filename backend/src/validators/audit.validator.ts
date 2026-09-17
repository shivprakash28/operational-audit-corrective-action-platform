import { z } from "zod";

export const createAuditSchema = z.object({
  title: z.string().min(1, "Title is required"),
  scope: z.string().min(1, "Scope is required"),
  departmentId: z.coerce.number().int().positive(),
  objectives: z.string().min(1, "Objectives are required"),
  criteria: z.string().min(1, "Criteria is required"),
  plannedStartDate: z.string().datetime(),
  plannedEndDate: z.string().datetime(),
  expectedCompletionDate: z.string().datetime(),
});

export const updateAuditSchema = createAuditSchema.partial();