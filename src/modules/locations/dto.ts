import { z } from "zod";

export const LongitudeSchema = z.number().min(-180).max(180);
export const LatitudeSchema = z.number().min(-90).max(90);

export const NumberStringSchema = z
  .string()
  .refine((val) => !isNaN(Number(val)), {
    message: "String must be convertible to a number",
  })
  .transform(Number);

export const FindManyLocationsQuerySchema = z.object({
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
});
