import {
  categories,
  favorites,
  locations,
  locationsToCategories,
  users,
} from "./schema";
import { db } from "./index";
import { reset, seed } from "drizzle-seed";
import { GEOGRAPHY_SRID } from "./column";
import { sql } from "drizzle-orm";

const locationsCount = parseInt(process.env.LOCATIONS || "1000000");
const usersCount = parseInt(process.env.USERS || "5");

export async function drizzleSeed() {
  try {
    const schema = {
      locations,
      users,
      favorites,
      categories,
      locationsToCategories,
    };
    await reset(db, schema);

    await seed(db, schema).refine((f) => ({
      locations: {
        count: locationsCount,
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
        count: usersCount,
        columns: { name: f.fullName() },
      },
      favorites: {
        count: 5,
        columns: {
          label: f.valuesFromArray({ values: ["home", "office"] }),
        },
      },

      categories: {
        count: 5,
        columns: {
          name: f.valuesFromArray({
            values: [
              "Supermarket",
              "School",
              "Gas station",
              "Office building",
              "Metro",
            ],
            isUnique: true,
          }),
        },
      },
      locationsToCategories: {
        count: 20,
      },
    }));

    console.info("Seeded");
    console.table({ locations: locationsCount, users: usersCount });
  } catch (err) {
    console.log(err);
  } finally {
    db.$client.end();
  }
}

drizzleSeed();
