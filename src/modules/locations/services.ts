import { sql } from "drizzle-orm";
import { db } from "../../db";
import { GEOGRAPHY_SRID, locationsTable } from "../../db/schema";

type FindLocationsQuery = {point: {x: number, y: number}}

export async function findLocations({point}: FindLocationsQuery) {
  const sqlPoint = sql`ST_GeomFromText('POINT(${point.x} ${point.y})', ${GEOGRAPHY_SRID})`
  const locations = await db.select().from(locationsTable).where(sql`ST_Distance_Sphere(${locationsTable.coordinates}, ${sqlPoint})`)
  return locations
}
