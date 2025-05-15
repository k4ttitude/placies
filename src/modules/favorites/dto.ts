import { z } from "zod";
import { IdSchema, PaginationQuerySchema } from "../common/dto";
import { LocationSchema } from "../locations/dto";

export const FavoriteSchema = z.object({
  id: IdSchema,
  userId: IdSchema,
  locationId: IdSchema,
  label: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const FavoriteWithLocationSchema = FavoriteSchema.extend({
  location: LocationSchema.nullable(),
});

export const FindManyFavoritesQuerySchema = z
  .object({ q: z.string().optional() })
  .merge(PaginationQuerySchema);
export type FindManyFavoritesQuery = z.infer<
  typeof FindManyFavoritesQuerySchema
>;

export const FindManyFavoritesResponseSchema = z.object({
  results: FavoriteWithLocationSchema.array(),
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
