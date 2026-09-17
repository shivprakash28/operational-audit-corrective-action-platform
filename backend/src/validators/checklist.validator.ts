import { z } from "zod";

export const createChecklistTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
});

export const createChecklistItemSchema = z.object({
  question: z.string().min(1, "Question is required"),
  description: z.string().optional(),
  order: z.coerce.number().int().positive(),
});

export const assignChecklistSchema = z.object({
  templateId: z.coerce.number().int().positive(),
});

export const checklistResponseSchema = z.object({
  checklistItemId: z.coerce.number().int().positive(),
  status: z.enum(["COMPLIANT", "NON_COMPLIANT", "NA"]),
  remarks: z.string().optional(),
});