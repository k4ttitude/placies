import { Router } from "express";
import { route } from "../../helpers/route";
import { getUsers } from "./services";

const usersRouter: Router = Router();

usersRouter.get(
  "/",
  route({}, async (_req, res) => {
    const users = await getUsers();
    res.status(200).send(users);
  }),
);

export { usersRouter };
