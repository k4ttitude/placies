import { z } from "zod";
import { NumberStringSchema } from "../../helpers/validations";
import { IdSchema, PaginationQuerySchema } from "../common/dto";

export const LongitudeSchema = z.number().min(-180).max(180);
export const LatitudeSchema = z.number().min(-90).max(90);

export const LocationSchema = z.object({
  id: IdSchema,
  longitude: z.string(),
  latitude: z.string(),
  name: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const FindManyLocationsQuerySchema = z
  .object({
    lng: NumberStringSchema.pipe(LongitudeSchema),
    lat: NumberStringSchema.pipe(LatitudeSchema),
    distance: NumberStringSchema.pipe(z.number().positive()).describe(
      "Distance in meters",
    ),
    bound: z
      .object({
        top: LatitudeSchema,
        bottom: LatitudeSchema,
        left: LongitudeSchema,
        right: LongitudeSchema,
      })
      .optional(),
    q: z.string().optional().describe("Search by location or category name."),
  })
  .merge(PaginationQuerySchema);

export const FindManyLocationsResponseSchema = z.object({
  results: z
    .object({
      id: z.number().int(),
      longitude: z.string(),
      latitude: z.string(),
      // coordinates: z.object({
      //   x: z.number(),
      //   y: z.number(),
      // }),
      name: z.string().nullable(),
      createdAt: z.date(),
      updatedAt: z.date(),
      distance: z.number(),
    })
    .array(),
  pagination: PaginationQuerySchema,
});
export type FindManyLocationsResponse = z.infer<
  typeof FindManyLocationsResponseSchema
>;

export const CreateLocationBodySchema = z.object({
  lng: LongitudeSchema,
  lat: LongitudeSchema,
  name: z.string().max(255),
});
export type CreateLocationBody = z.infer<typeof CreateLocationBodySchema>;

export const UpdateLocationBodySchema = CreateLocationBodySchema.partial();
export type UpdateLocationBody = z.infer<typeof UpdateLocationBodySchema>;
