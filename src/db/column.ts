import { sql } from "drizzle-orm";
import { customType } from "drizzle-orm/mysql-core";

/**
 * Geogprahic data type
 */
export const GEOGRAPHY_SRID = 4326;

export function sqlGeographicPoint(point: { lng: number; lat: number }) {
  // Return POINT as WKT (Well-Known Text) with SRID 4326
  return sql`ST_GeomFromText('POINT(${point.lat} ${point.lng})', ${GEOGRAPHY_SRID})`;
}

export const point = customType<{ data: { x: number; y: number } }>({
  dataType: () => "POINT",
});
