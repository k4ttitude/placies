import { reset } from "drizzle-seed";
import { db } from "../../db";
import { locations } from "../../db/schema";
import { findLocations } from "./services";

beforeAll(async () => {
  await reset(db, { locations });
});

afterAll(async () => {
  await db.$client.end();
});

describe("locations services", () => {
  it("findLocations should work", async () => {
    const input = { longitude: "0", latitude: "0" };
    await db.insert(locations).values(input);

    const results = await findLocations({
      point: { lng: 0, lat: 0 },
      distanceInMeters: 100_000,
    });

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          longitude: expect.stringMatching("0"),
          latitude: expect.stringMatching("0"),
        }),
      ]),
    );
  });

  it("findLocations should work with center point near 180°E / -180°E", async () => {
    const input = { longitude: "180", latitude: "0" };
    await db.insert(locations).values(input);

    const result = await findLocations({
      point: { lng: -180, lat: 0 },
      distanceInMeters: 1_000,
    });

    expect(result.results.length).toBeGreaterThanOrEqual(1);
  });

  it("findLocations should work with bounding box near 180°E / -180°E", async () => {
    const input = { longitude: "180", latitude: "0" };
    await db.insert(locations).values(input);

    const result = await findLocations({
      point: { lng: -180, lat: 0 },
      bound: { top: 1, bottom: -1, left: 178, right: -178 },
      distanceInMeters: 1_000,
    });

    expect(result.results.length).toBeGreaterThanOrEqual(1);
  });
});
