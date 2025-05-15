import { Router } from "express";
import { route } from "../../helpers/route";
import { getUsers } from "./services";
import { openApiRegistry } from "../../openapi";

const usersRouter = Router();

openApiRegistry.registerPath({
  path: "/users",
  method: "get",
  summary: "Get all users",
  tags: ["users"],
  responses: {
    200: {
      description: "Users list",
      content: { "application/json": { schema: {} } },
    },
  },
});
usersRouter.get(
  "/",
  route({}, async (_req, res) => {
    const users = await getUsers();
    res.status(200).send(users);
  }),
);

export { usersRouter };
