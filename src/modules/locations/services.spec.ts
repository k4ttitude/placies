import { inArray } from "drizzle-orm";
import { db } from "../../db";
import { locations } from "../../db/schema";
import { findLocations } from "./services";

let inserted: { id: number }[];

beforeAll(async () => {
  const inputs = [
    { longitude: "0", latitude: "0" },
    { longitude: "180", latitude: "0" },
  ];
  inserted = await db.insert(locations).values(inputs).$returningId();
});

afterAll(async () => {
  await db.delete(locations).where(
    inArray(
      locations.id,
      inserted.map((ins) => ins.id),
    ),
  );
  await db.$client.end();
});

describe("locations services", () => {
  it("findLocations should work", async () => {
    const result = await findLocations({
      point: { lng: 0, lat: 0 },
      distanceInMeters: 100_000,
    });

    expect(result.results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          longitude: expect.stringMatching("0"),
          latitude: expect.stringMatching("0"),
        }),
      ]),
    );
  });

  it("findLocations should work with center point near 180°E / -180°E", async () => {
    const result = await findLocations({
      point: { lng: -180, lat: 0 },
      distanceInMeters: 1_000,
    });

    expect(result.results.length).toBeGreaterThanOrEqual(1);
  });

  it("findLocations should work with bounding box near 180°E / -180°E", async () => {
    const result = await findLocations({
      point: { lng: -180, lat: 0 },
      bound: { top: 1, bottom: -1, left: 178, right: -178 },
      distanceInMeters: 1_000,
    });

    expect(result.results.length).toBeGreaterThanOrEqual(1);
  });
});
