import { z } from "zod";

export const NumberStringSchema = z
  .union([z.string(), z.number()])
  .refine((val) => !isNaN(Number(val)), {
    message: "Must be a number (or string convertible to number)",
  })
  .transform(Number);
