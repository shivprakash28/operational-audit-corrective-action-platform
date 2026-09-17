import { z } from "zod";

export const createObservationSchema = z.object({
  checklistItemId: z.coerce.number().int().positive(),
  description: z.string().min(1, "Description is required"),
  evidenceUrl: z.string().url().optional(),
});