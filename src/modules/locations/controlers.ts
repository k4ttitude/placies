import { Router } from "express";
import * as locationsServices from "./services";
import {
  CreateLocationBodySchema,
  FindManyLocationsQuerySchema,
  UpdateLocationBodySchema,
} from "./dto";
import { route } from "../../helpers/route";
import { z } from "zod";
import { NumberStringSchema } from "../../helpers/validations";
import { apikeyAuth } from "../auth/guard";

const locationsRouter: Router = Router();

/**
 * Public route
 */
locationsRouter.get(
  "/",
  route({ query: FindManyLocationsQuerySchema }, async (req, res) => {
    const { lng: lng, lat, distance, bound } = req.query;
    const results = await locationsServices.findLocations({
      point: { lng, lat },
      distanceInMeters: distance,
      bound,
    });

    return res.status(200).send(results);
  }),
);

/**
 * Authenticated routes
 */
locationsRouter.use(apikeyAuth);

locationsRouter.post(
  "/",
  route({ body: CreateLocationBodySchema }, async (req, res) => {
    const created = await locationsServices.createLocation(req.body);

    return res.status(201).send(created);
  }),
);

locationsRouter.patch(
  "/:id",
  route(
    {
      params: z.object({ id: NumberStringSchema }),
      body: UpdateLocationBodySchema,
    },
    async (req, res) => {
      const updated = await locationsServices.updateLocation(
        req.params.id,
        req.body,
      );

      return res.status(200).send(updated);
    },
  ),
);

locationsRouter.delete(
  "/:id",
  route({ params: z.object({ id: NumberStringSchema }) }, async (req, res) => {
    await locationsServices.deleteLocation(req.params.id);

    return res.status(200).end();
  }),
);

export { locationsRouter };
