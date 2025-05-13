import { z } from "zod";

export const NumberStringSchema = z
  .string()
  .refine((val) => !isNaN(Number(val)), {
    message: "Must be a number (or string convertible to number)",
  })
  .transform(Number);
