import { z } from "zod";
import { NumberStringSchema } from "../../helpers/validations";
import { PaginationQuerySchema } from "../common/dto";

export const LongitudeSchema = z.number().min(-180).max(180);
export const LatitudeSchema = z.number().min(-90).max(90);

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
  })
  .merge(PaginationQuerySchema);

export const CreateLocationBodySchema = z.object({
  lng: LongitudeSchema,
  lat: LongitudeSchema,
  name: z.string().max(255),
});
export type CreateLocationBody = z.infer<typeof CreateLocationBodySchema>;

export const UpdateLocationBodySchema = CreateLocationBodySchema.partial();
export type UpdateLocationBody = z.infer<typeof UpdateLocationBodySchema>;
