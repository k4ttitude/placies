import { Router } from "express";
import * as locationsServices from "./services";
import { FindManyLocationsQuerySchema } from "./dto";
import { route } from "../../helpers/route";

const locationsRouter: Router = Router();

locationsRouter.get(
  "/",
  route({ query: FindManyLocationsQuerySchema }, async (req, res) => {
    const { lng, lat, distance, bound } = req.query;
    const results = await locationsServices.findLocations({
      point: { lng, lat },
      distanceInMeters: distance,
      bound,
    });

    return res.status(200).send(results);
  }),
);

export { locationsRouter };
