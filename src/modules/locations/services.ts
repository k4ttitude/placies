import { and, eq, getTableColumns, lte, sql } from "drizzle-orm";
import { db } from "../../db";
import { locations } from "../../db/schema";
import { sqlGeographicPoint } from "../../db/column";
import { CreateLocationBody, UpdateLocationBody } from "./dto";

const KM_PER_LAT = 111.32;

function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

type FindLocationsQuery = {
  point: { lat: number; lng: number };
  bound?: { top: number; bottom: number; left: number; right: number };
  distanceInMeters: number; // distance in meters
};

/**
 * Find locations within a specified distance (in meters) from a point
 * @param params - Search parameters
 * @param params.point - Center point coordinates {lat, lng}
 * @param params.bound - Optional bounding box {top, bottom, left, right}
 * @param params.distanceInMeters - Search radius in meters
 * @returns Array of locations with calculated distances
 */
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
    )
    .limit(10);

  console.timeEnd(key);

  return locationRecords;
}

export async function findLocation(id: number) {
  const location = await db.query.locations.findFirst({
    where: eq(locations.id, id),
  });

  if (!locations) {
    throw new Error("not found");
  }

  return location;
}

export async function createLocation(payload: CreateLocationBody) {
  const { lng: lng, lat: lat, name } = payload;
  const [{ id }] = await db
    .insert(locations)
    .values({ longitude: lng.toString(), latitude: lat.toString(), name })
    .$returningId();

  const inserted = await db.query.locations.findFirst({
    where: eq(locations.id, id),
  });

  return inserted;
}

export async function updateLocation(id: number, payload: UpdateLocationBody) {
  await findLocation(id);

  const { lng, lat, name } = payload;
  await db
    .update(locations)
    .set({
      longitude: lng?.toString(),
      latitude: lat?.toString(),
      name,
    })
    .where(eq(locations.id, id));

  const updated = await db.query.locations.findFirst({
    where: eq(locations.id, id),
  });

  return updated;
}

export async function deleteLocation(id: number) {
  await findLocation(id);

  await db.delete(locations).where(eq(locations.id, id));
}
