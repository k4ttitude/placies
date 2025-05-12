import { sql } from "drizzle-orm";
import {
  index,
  mysqlTable,
  varchar,
  timestamp,
  char,
  customType,
  serial,
  primaryKey,
  bigint,
} from "drizzle-orm/mysql-core";

/**
 * Geogprahic data type
 */
export const GEOGRAPHY_SRID = 4326;

export function sqlGeographicPoint(point: { lng: number; lat: number }) {
  // Return POINT as WKT (Well-Known Text) with SRID 4326
  return sql`ST_GeomFromText('POINT(${point.lat} ${point.lng})', ${GEOGRAPHY_SRID})`;
}

const point = customType<{
  data: { lng: number; lat: number };
  driverData: { x: number; y: number }; // mysql2 returns geographic point in format { x, y }
}>({
  dataType() {
    return "POINT";
  },

  toDriver(value) {
    if (value) {
      return sqlGeographicPoint(value);
    }
    return value;
  },

  fromDriver(value) {
    return { lng: value.x, lat: value.y };
  },
});

/**
 * Models
 */
export const usersTable = mysqlTable("users", {
  id: char("id", { length: 36 })
    .primaryKey()
    .default(sql`(UUID())`),
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const locationsTable = mysqlTable(
  "locations",
  {
    id: serial().primaryKey(),
    coordinates: point("coordinates").notNull(),
    name: varchar("name", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => [index("coordinates_spatial_idx").on(t.coordinates)],
);

export const favorites = mysqlTable(
  "favorites",
  {
    userId: char("user_id", { length: 36 }).references(() => usersTable.id),
    locationId: bigint("location_id", {
      mode: "bigint",
      unsigned: true,
    }).references(() => locationsTable.id),
    label: varchar("label", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.locationId] })],
);
