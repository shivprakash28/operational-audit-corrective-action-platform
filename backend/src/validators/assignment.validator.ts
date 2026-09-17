import { z } from "zod";

export const assignAuditorSchema = z.object({
  auditorId: z.coerce.number().int().positive(),
});