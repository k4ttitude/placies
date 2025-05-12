import { SQL, sql } from "drizzle-orm";
import {
  index,
  mysqlTable,
  varchar,
  timestamp,
  char,
  serial,
  primaryKey,
  bigint,
  decimal,
  customType,
} from "drizzle-orm/mysql-core";

/**
 * Geogprahic data type
 */
export const GEOGRAPHY_SRID = 4326;

export function sqlGeographicPoint(point: { lng: number; lat: number }) {
  // Return POINT as WKT (Well-Known Text) with SRID 4326
  return sql`ST_GeomFromText('POINT(${point.lat} ${point.lng})', ${GEOGRAPHY_SRID})`;
}

const point = customType({
  dataType: () => "POINT",
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

export const locations = mysqlTable(
  "locations",
  {
    id: serial().primaryKey(),
    longitude: decimal({ precision: 11, scale: 8 }).notNull(),
    latitude: decimal({ precision: 10, scale: 8 }).notNull(),
    coordinates: point()
      .notNull()
      .generatedAlwaysAs(
        (): SQL =>
          sql.raw(
            `ST_PointFromText(CONCAT('POINT(', latitude, ' ', longitude, ')'), ${GEOGRAPHY_SRID})`,
          ),
        { mode: "stored" },
      ),
    name: varchar("name", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("longitude_idx").on(table.longitude),
    index("latitude_idx").on(table.latitude),
    index("coordinates_spatial_idx").on(table.coordinates),
  ],
);

export const favorites = mysqlTable(
  "favorites",
  {
    userId: char("user_id", { length: 36 }).references(() => usersTable.id),
    locationId: bigint("location_id", {
      mode: "bigint",
      unsigned: true,
    }).references(() => locations.id),
    label: varchar("label", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.locationId] })],
);
