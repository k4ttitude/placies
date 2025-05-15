import { Router } from "express";
import { route } from "../../helpers/route";
import {
  createFavorite,
  findManyFavorties,
  removeFavorite,
  updateFavorite,
} from "./services";
import {
  CreateFavoriteBodySchema,
  FavoriteSchema,
  FindManyFavoritesQuerySchema,
  FindManyFavoritesResponseSchema,
  UpdateFavoriteBodySchema,
} from "./dto";
import { apikeyAuth } from "../auth/guard";
import { IdParamsSchema } from "../common/dto";
import { apikeyAuthSecurity, openApiRegistry } from "../../openapi";

const favoritesRouter = Router();

favoritesRouter.use(apikeyAuth);

openApiRegistry.registerPath({
  path: "/favorites",
  method: "get",
  summary: "Find user favorites",
  description: "Find user favorites, query for label or location name.",
  tags: ["favorites"],
  request: { query: FindManyFavoritesQuerySchema },
  security: [apikeyAuthSecurity],
  responses: {
    200: {
      description: "Results",
      content: {
        "application/json": { schema: FindManyFavoritesResponseSchema },
      },
    },
  },
});
favoritesRouter.get(
  "/",
  route({ query: FindManyFavoritesQuerySchema }, async (req, res) => {
    const favorites = await findManyFavorties(req.user!.id, req.query);
    return res.status(200).send(favorites);
  }),
);

openApiRegistry.registerPath({
  path: "/favorites",
  method: "post",
  summary: "Create user favorite",
  tags: ["favorites"],
  request: {
    body: {
      content: { "application/json": { schema: CreateFavoriteBodySchema } },
    },
  },
  security: [apikeyAuthSecurity],
  responses: {
    200: {
      description: "Results",
      content: { "application/json": { schema: FavoriteSchema } },
    },
  },
});
favoritesRouter.post(
  "/",
  route({ body: CreateFavoriteBodySchema }, async (req, res) => {
    const inserted = await createFavorite(req.user!.id, req.body);
    return res.status(200).send(inserted);
  }),
);

openApiRegistry.registerPath({
  path: "/favorites/{id}",
  method: "patch",
  summary: "Update user favorite",
  tags: ["favorites"],
  request: {
    params: IdParamsSchema,
    body: {
      content: { "application/json": { schema: UpdateFavoriteBodySchema } },
    },
  },
  security: [apikeyAuthSecurity],
  responses: {
    200: {
      description: "Results",
      content: { "application/json": { schema: FavoriteSchema } },
    },
  },
});
favoritesRouter.patch(
  "/:id",
  route(
    { params: IdParamsSchema, body: UpdateFavoriteBodySchema },
    async (req, res) => {
      console.log(req.params);
      const updated = await updateFavorite(
        req.user!.id,
        req.params.id,
        req.body,
      );
      return res.status(200).send(updated);
    },
  ),
);

openApiRegistry.registerPath({
  path: "/favorites/:id",
  method: "delete",
  summary: "Delete user favorite",
  tags: ["favorites"],
  request: { params: IdParamsSchema },
  security: [apikeyAuthSecurity],
  responses: {
    200: { description: "Deleted" },
  },
});
favoritesRouter.delete(
  "/:id",
  route({ params: IdParamsSchema }, async (req, res) => {
    await removeFavorite(req.user!.id, req.params.id);
    return res.status(200).send();
  }),
);

export { favoritesRouter };
