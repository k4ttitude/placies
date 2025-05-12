import { and, getTableColumns, lte, sql } from "drizzle-orm";
import { db } from "../../db";
import { sqlGeographicPoint, locations } from "../../db/schema";

const KM_PER_LAT = 111.32;

function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

type FindLocationsQuery = {
  point: { lat: number; lng: number };
  distanceInMeters: number; // distance in meters
};

export async function findLocations({
  point,
  distanceInMeters,
}: FindLocationsQuery) {
  const now = Date.now();
  const key = `Find locations (${now}):`;
  console.time(key);

  const centrePoint = sqlGeographicPoint(point);

  const distanceInKm = distanceInMeters / 1000;
  const kmPerDeltaLng = KM_PER_LAT * Math.cos(degreesToRadians(point.lat));

  console.log(distanceInKm);

  const locationRecords = await db
    .select({
      ...getTableColumns(locations),
      distance: sql`ST_Distance_Sphere(${locations.coordinates}, ${centrePoint})`,
    })
    .from(locations)
    .where(
      and(
        sql`ABS(${locations.latitude} - ${point.lat}) * ${KM_PER_LAT}  <= ${distanceInKm}`,
        sql`ABS(${locations.longitude} - ${point.lng}) * ${kmPerDeltaLng} <= ${distanceInKm}`,
      ),
    );
  // .having(({ distance: calculatedDistance }) =>
  //   lte(calculatedDistance, distanceInKm),
  // );

  console.timeEnd(key);
  return locationRecords;
}
