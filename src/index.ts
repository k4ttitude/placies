import "./configs/env";

import express from "express";
import { findLocations } from "./modules/locations/services";

const app = express();
const PORT = 3000;

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.get("/locations", async (req, res) => {
  const locations = await findLocations({
    point: { lng: 106.167665996, lat: 20.418664992 },
    distanceInMeters: 100_000,
    bound: { top: 24, bottom: 21, left: 105, right: 107 },
  });
  res.status(200).send(JSON.stringify(locations));
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
