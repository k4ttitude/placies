import { Router } from "express";
import { route } from "../../helpers/route";
import {
  createFavorite,
  findManyFavorties,
  removeFavorite,
  updateFavorite,
} from "./services";
import { CreateFavoriteBodySchema, FindManyFavoritesQuerySchema } from "./dto";
import { apikeyAuth } from "../auth/guard";
import { IdParamsSchema } from "../common/dto";

const favoritesRouter: Router = Router();

favoritesRouter.use(apikeyAuth);

favoritesRouter.get(
  "/",
  route({ query: FindManyFavoritesQuerySchema }, async (req, res) => {
    const favorites = await findManyFavorties(req.user!.id, req.query);
    return res.status(200).send(favorites);
  }),
);

favoritesRouter.post(
  "/",
  route({ body: CreateFavoriteBodySchema }, async (req, res) => {
    const inserted = await createFavorite(req.user!.id, req.body);
    return res.status(200).send(inserted);
  }),
);

favoritesRouter.patch(
  "/:id",
  route(
    { params: IdParamsSchema, body: CreateFavoriteBodySchema },
    async (req, res) => {
      const updated = await updateFavorite(
        req.user!.id,
        req.params.id,
        req.body,
      );
      return res.status(200).send(updated);
    },
  ),
);

favoritesRouter.delete(
  "/:id",
  route({ params: IdParamsSchema }, async (req, res) => {
    await removeFavorite(req.user!.id, req.params.id);
    return res.status(200).send();
  }),
);

export { favoritesRouter };
