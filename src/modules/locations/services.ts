import { sql } from "drizzle-orm";
import { db } from "../../db";
import { sqlGeographicPoint, locationsTable } from "../../db/schema";

type FindLocationsQuery = {
  point: { lat: number; lng: number };
  distance: number; // distance in meters
};

export async function findLocations({ point, distance }: FindLocationsQuery) {
  const sqlPoint = sqlGeographicPoint(point);
  const distanceInMilimeters = distance * 1000;
  const locations = await db
    .select()
    .from(locationsTable)
    .where(
      sql`ST_Distance_Sphere(${locationsTable.coordinates}, ${sqlPoint}) < ${distanceInMilimeters}`,
    );
  return locations;
}
