import { locations, users } from "./schema"; // Adjust import path as needed
import { db } from "./index";
import { reset, seed } from "drizzle-seed";
import { GEOGRAPHY_SRID } from "./column";
import { sql } from "drizzle-orm";

export async function drizzleSeed() {
  try {
    const schema = { locations, users };
    await reset(db, schema);

    await db
      .insert(users)
      .values({ id: "00000000-0000-0000-0000-000000000000", name: "John Doe" });
    await seed(db, schema).refine((f) => ({
      locations: {
        count: 1_000_000,
        columns: {
          name: f.city(),
          longitude: f.number({ minValue: -180, maxValue: 180 }),
          latitude: f.number({ minValue: -90, maxValue: 90 }),
          coordinates: f.default({
            defaultValue: sql`ST_GeomFromText('POINT(${locations.latitude} ${locations.longitude})', ${GEOGRAPHY_SRID})`,
          }),
        },
      },
      users: {
        count: 5,
        columns: {
          id: f.uuid(),
          name: f.fullName(),
        },
      },
    }));

    console.info("Seeded");
    console.table({ locations: 1_000_000, users: 6 });
  } catch (err) {
    console.log(err);
  } finally {
    db.$client.end();
  }
}

// manualSeed();
drizzleSeed();
