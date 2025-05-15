import "./configs/env";

import express from "express";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";

import { env } from "./configs/env";
import { locationsRouter } from "./modules/locations/controlers";
import { errorHandler } from "./error";
import { usersRouter } from "./modules/users/controllers";
import { favoritesRouter } from "./modules/favorites/controllers";
import { generateOpenApiDocs } from "./openapi";

const app = express();

app.use(bodyParser.json());

// routes
app.get("/health", (_, res) => {
  res.status(200).send("OK");
});
app.use("/locations", locationsRouter);
app.use("/users", usersRouter);
app.use("/favorites", favoritesRouter);
// end routes

// swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(generateOpenApiDocs()));
app.get("/", (_, res) => {
  res.redirect("/api-docs");
});

app.use(errorHandler);

const port = env.PORT;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
