import { z } from "zod";
import { IdSchema, PaginationQuerySchema } from "../common/dto";

export const FavoriteSchema = z.object({
  id: z.number(),
  userId: z.number(),
  locationId: z.number(),
  label: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const FindManyFavoritesQuerySchema = z
  .object({ q: z.string().optional() })
  .merge(PaginationQuerySchema);
export type FindManyFavoritesQuery = z.infer<
  typeof FindManyFavoritesQuerySchema
>;

export const FindManyFavoritesResponseSchema = z.object({
  results: FavoriteSchema.array(),
  pagination: PaginationQuerySchema.extend({ total: z.number() }),
});
export type FindManyFavoritesResponse = z.infer<
  typeof FindManyFavoritesResponseSchema
>;

export const CreateFavoriteBodySchema = z.object({
  locationId: IdSchema,
  label: z.string().optional(),
});
export type CreateFavoriteBody = z.infer<typeof CreateFavoriteBodySchema>;

export const UpdateFavoriteBodySchema = CreateFavoriteBodySchema.partial();
export type UpdateFavoriteBody = z.infer<typeof UpdateFavoriteBodySchema>;
