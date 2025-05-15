import { z } from "zod";
import { NumberStringSchema } from "../../helpers/validations";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const IdSchema = NumberStringSchema.pipe(z.number());
export type Id = z.infer<typeof IdSchema>;

export const IdParamsSchema = z.object({
  id: IdSchema.openapi({ param: { name: "id", in: "path" } }),
});

export const PaginationQuerySchema = z.object({
  limit: NumberStringSchema.pipe(z.number().nonnegative()).default("10"),
  offset: NumberStringSchema.pipe(z.number().nonnegative()).default("0"),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export const DEFAULT_PAGINATION = { limit: 10, offset: 0 };
