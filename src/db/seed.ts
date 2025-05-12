import { locations } from "./schema"; // Adjust import path as needed
import { faker } from "@faker-js/faker";
import { db } from ".";
import { seed } from "drizzle-seed";

/**
 * Manual seed
 */
const BATCH_SIZE = 5000;
const TOTAL_RECORDS = 1_000_000;

function generateRandomLocation() {
  return {
    name: faker.location.city(),
    latitude: faker.location.latitude().toString(),
    longitude: faker.location.longitude().toString(),
  };
}

async function manualSeed() {
  try {
    console.log("Starting to seed 1 million location records...");
    console.time("Seeding completed in");

    const totalBatches = Math.ceil(TOTAL_RECORDS / BATCH_SIZE);
    let completedRecords = 0;

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchSize = Math.min(BATCH_SIZE, TOTAL_RECORDS - completedRecords);
      const batchData = Array.from(
        { length: batchSize },
        generateRandomLocation,
      );

      await db.insert(locations).values(batchData);

      completedRecords += batchSize;
      const progressPercent = (
        (completedRecords / TOTAL_RECORDS) *
        100
      ).toFixed(2);
      console.log(
        `Progress: ${completedRecords.toLocaleString()} / ${TOTAL_RECORDS.toLocaleString()} (${progressPercent}%)`,
      );
    }

    console.timeEnd("Seeding completed in");
  } finally {
    db.$client.end();
  }
}

manualSeed();

/**
 * drizzle-seed
 * currently not working, due to missing exports from "drizzle-seed/services/Generators"
 */
export async function drizzleSeed() {
  const { getGeneratorsFunctions } = await import("drizzle-seed");
  const { AbstractGenerator } = await import(
    "drizzle-seed/services/Generators"
  );

  class CoordinatesGenerator extends AbstractGenerator<{
    lng: number;
    lat: number;
  }> {
    pointGenerator;

    constructor() {
      super();
      this.pointGenerator = getGeneratorsFunctions().point({
        minXValue: -180,
        maxXValue: 180,
        minYValue: -90,
        maxYValue: 90,
      });
    }

    generate(): { lng: number; lat: number } {
      const [x, y] = this.pointGenerator.generate() as [number, number];
      return { lng: x, lat: y };
    }
  }

  await seed(db, { locations }).refine((f) => ({
    locations: {
      count: 1_000_000,
      columns: {
        name: f.city(),
        coordinates: new CoordinatesGenerator(),
      },
    },
  }));
}
