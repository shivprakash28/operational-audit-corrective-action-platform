import { z } from "zod";

export const createFindingSchema = z.object({
  severity: z.enum(["MINOR", "MAJOR", "CRITICAL"]),
  responsibleDepartmentId: z.coerce.number().int().positive(),
  ownerId: z.coerce.number().int().positive().optional(),
  description: z.string().min(1, "Description is required"),
});

export const updateFindingSchema = z.object({
  severity: z.enum(["MINOR", "MAJOR", "CRITICAL"]).optional(),
  responsibleDepartmentId: z.coerce.number().int().positive().optional(),
  ownerId: z.coerce.number().int().positive().nullable().optional(),
  status: z
    .enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"])
    .optional(),
  description: z.string().min(1).optional(),
});