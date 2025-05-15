import { and, eq, getTableColumns, like, lte, or, sql } from "drizzle-orm";
import { db } from "../../db";
import { categories, locations, locationsToCategories } from "../../db/schema";
import { sqlGeographicPoint } from "../../db/column";
import { PlaciesError } from "../../error";
import {
  CreateLocationBody,
  FindManyLocationsResponse,
  UpdateLocationBody,
} from "./dto";
import { DEFAULT_PAGINATION, PaginationQuery } from "../common/dto";

const KM_PER_LAT = 111.32;

function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

type FindLocationsQuery = Partial<PaginationQuery> & {
  point: { lat: number; lng: number };
  bound?: { top: number; bottom: number; left: number; right: number };
  distanceInMeters: number;
  q?: string;
};

/**
 * Find locations within a specified distance (in meters) from a point
 * @param params - Search parameters
 * @param params.point - Center point coordinates {lat, lng}
 * @param params.bound - Optional bounding box {top, bottom, left, right}
 * @param params.distanceInMeters - Search radius in meters
 * @param params.q - Search query applying to location name and category
 * @returns Array of locations with calculated distances
 */
export async function findLocations({
  point,
  bound,
  distanceInMeters,
  q,
  limit = DEFAULT_PAGINATION.limit,
  offset = DEFAULT_PAGINATION.offset,
}: FindLocationsQuery): Promise<FindManyLocationsResponse> {
  const now = new Date().toISOString();
  const key = `${now} Find locations:`;
  console.time(key);

  const distanceInKm = distanceInMeters / 1000;
  const kmPerDeltaLng = KM_PER_LAT * Math.cos(degreesToRadians(point.lat));

  // bounding box conditions by distance
  const conditions = [
    sql`ABS(${locations.latitude} - ${point.lat}) * ${KM_PER_LAT}  <= ${distanceInKm}`,
    or(
      sql`ABS(${locations.longitude} - ${point.lng}) * ${kmPerDeltaLng} <= ${distanceInKm}`,
      sql`ABS(${locations.longitude} - ${point.lng} + 360) * ${kmPerDeltaLng} <= ${distanceInKm}`,
      sql`ABS(${locations.longitude} - ${point.lng} - 360) * ${kmPerDeltaLng} <= ${distanceInKm}`,
    ),
  ];

  if (bound) {
    // bound box conditions by bound
    // filter by these conditions first
    conditions.unshift(
      sql`${locations.latitude} <= ${bound.top}`,
      sql`${locations.latitude} >= ${bound.bottom}`,
      or(
        sql`${locations.longitude} BETWEEN ${bound.left} AND ${bound.right}`,
        sql`${locations.longitude} BETWEEN ${bound.left - 360} AND ${bound.right}`,
        sql`${locations.longitude} BETWEEN ${bound.left} AND ${bound.right + 360}`,
      ),
    );
  }

  if (q) {
    const lowerCaseQ = `%${q.toLowerCase()}%`;
    conditions.push(
      like(locations.nameLowerCase, lowerCaseQ),
      or(like(categories.nameLowerCase, lowerCaseQ)),
    );
  }

  const centrePoint = sqlGeographicPoint(point);

  const locationRecords = await db
    .select({
      ...getTableColumns(locations),
      distance: sql<number>`ST_Distance_Sphere(${locations.coordinates}, ${centrePoint})`,
    })
    .from(locations)
    .leftJoin(
      locationsToCategories,
      eq(locations.id, locationsToCategories.locationId),
    )
    .leftJoin(categories, eq(categories.id, locationsToCategories.categoryId))
    .where(and(...conditions))
    .having(({ distance: calculatedDistance }) =>
      lte(calculatedDistance, distanceInMeters),
    )
    .limit(limit)
    .offset(offset);

  console.timeEnd(key);

  return { results: locationRecords, pagination: { limit, offset } };
}

export async function findLocation(id: number) {
  const location = await db.query.locations.findFirst({
    where: eq(locations.id, id),
  });

  if (!location) {
    throw new PlaciesError("Location not found", 404);
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
