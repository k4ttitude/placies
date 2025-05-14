import { z } from "zod";
import { IdSchema, PaginationQuerySchema } from "../common/dto";

export const FindManyFavoritesQuerySchema = z
  .object({
    q: z.string().optional(),
  })
  .merge(PaginationQuerySchema);
export type FindManyFavoritesQuery = z.infer<
  typeof FindManyFavoritesQuerySchema
>;

export const CreateFavoriteBodySchema = z.object({
  locationId: IdSchema,
  label: z.string().optional(),
});
export type CreateFavoriteBody = z.infer<typeof CreateFavoriteBodySchema>;

export const UpdateFavoriteBodySchema = CreateFavoriteBodySchema.partial();
export type UpdateFavoriteBody = z.infer<typeof UpdateFavoriteBodySchema>;
