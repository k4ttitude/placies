import "./configs/env";

import express from "express";
import bodyParser from "body-parser";

import { env } from "./configs/env";
import { locationsRouter } from "./modules/locations/controlers";

const app = express();

app.use(bodyParser.json());

/**
 * Routes
 */
app.get("/health", (_, res) => {
  res.status(200).send("OK");
});

app.use("/locations", locationsRouter);

const port = env.PORT;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
