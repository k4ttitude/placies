import { and, getTableColumns, lte, sql } from "drizzle-orm";
import { db } from "../../db";
import { sqlGeographicPoint, locations } from "../../db/schema";

const KM_PER_LAT = 111.32;

function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

type FindLocationsQuery = {
  point: { lat: number; lng: number };
  bound?: { top: number; bottom: number; left: number; right: number };
  distanceInMeters: number; // distance in meters
};

export async function findLocations({
  point,
  bound,
  distanceInMeters,
}: FindLocationsQuery) {
  const now = new Date().toISOString();
  const key = `${now} Find locations:`;
  console.time(key);

  const distanceInKm = distanceInMeters / 1000;
  const kmPerDeltaLng = KM_PER_LAT * Math.cos(degreesToRadians(point.lat));

  const boundingBoxConditions = [
    sql`ABS(${locations.latitude} - ${point.lat}) * ${KM_PER_LAT}  <= ${distanceInKm}`,
    sql`ABS(${locations.longitude} - ${point.lng}) * ${kmPerDeltaLng} <= ${distanceInKm}`,
  ];

  if (bound) {
    // filter by these conditions first
    boundingBoxConditions.unshift(
      sql`${locations.latitude} <= ${bound.top}`,
      sql`${locations.latitude} >= ${bound.bottom}`,
      sql`${locations.longitude} >= ${bound.left}`,
      sql`${locations.longitude} <= ${bound.right}`,
    );
  }

  const centrePoint = sqlGeographicPoint(point);

  const locationRecords = await db
    .select({
      ...getTableColumns(locations),
      distance: sql`ST_Distance_Sphere(${locations.coordinates}, ${centrePoint})`,
    })
    .from(locations)
    .where(and(...boundingBoxConditions))
    .having(({ distance: calculatedDistance }) =>
      lte(calculatedDistance, distanceInMeters),
    );

  console.timeEnd(key);

  return locationRecords;
}
