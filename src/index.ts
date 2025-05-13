import "./configs/env";

import express from "express";

import { env } from "./configs/env";
import { locationsRouter } from "./modules/locations/controlers";

const app = express();
const port = env.PORT;

app.get("/health", (_, res) => {
  res.status(200).send("OK");
});

app.use("/locations", locationsRouter);

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
