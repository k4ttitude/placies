import { Router } from "express";
import * as locationsServices from "./services";
import {
  CreateLocationBodySchema,
  FindManyLocationsQuerySchema,
  FindManyLocationsResponseSchema,
  UpdateLocationBodySchema,
} from "./dto";
import { route } from "../../helpers/route";
import { apikeyAuth } from "../auth/guard";
import { openApiRegistry } from "../../openapi";
import { IdParamsSchema } from "../common/dto";

const locationsRouter = Router();

/**
 * Public route
 */
openApiRegistry.registerPath({
  path: "/locations",
  method: "get",
  summary: "Find locations",
  description:
    "Find locations near specified center point and distance. Bounding box is also supported.",
  tags: ["locations"],
  request: { query: FindManyLocationsQuerySchema },
  responses: {
    200: {
      description: "Results",
      content: {
        "application/json": { schema: FindManyLocationsResponseSchema },
      },
    },
  },
});
locationsRouter.get(
  "/",
  route({ query: FindManyLocationsQuerySchema }, async (req, res) => {
    const { lng, lat, distance, bound, q, limit, offset } = req.query;
    const results = await locationsServices.findLocations({
      point: { lng, lat },
      distanceInMeters: distance,
      bound,
      q,
      limit,
      offset,
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
      params: IdParamsSchema,
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
  route({ params: IdParamsSchema }, async (req, res) => {
    await locationsServices.deleteLocation(req.params.id);

    return res.status(200).end();
  }),
);

export { locationsRouter };
