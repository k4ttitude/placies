import { z } from "zod";
import { NumberStringSchema } from "../../helpers/validations";

export const IdSchema = NumberStringSchema.transform(Number).pipe(z.number());
export type Id = z.infer<typeof IdSchema>;

export const IdParamsSchema = z.object({ id: IdSchema });

export const PaginationQuerySchema = z.object({
  limit: NumberStringSchema.pipe(z.number().nonnegative()).default("10"),
  offset: NumberStringSchema.pipe(z.number().nonnegative()).default("0"),
});
