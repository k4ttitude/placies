import { SQL, sql } from "drizzle-orm";
import {
  index,
  mysqlTable,
  varchar,
  timestamp,
  char,
  decimal,
  unique,
  int,
} from "drizzle-orm/mysql-core";
import { GEOGRAPHY_SRID, point } from "./column";

export const users = mysqlTable("users", {
  id: int().autoincrement().primaryKey(),
  externalId: char("external_id", { length: 36 }),
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const locations = mysqlTable(
  "locations",
  {
    id: int().autoincrement().primaryKey(),
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
    id: int().autoincrement().primaryKey(),
    userId: int("user_id")
      .references(() => users.id)
      .notNull(),
    locationId: int("location_id")
      .references(() => locations.id)
      .notNull(),
    label: varchar("label", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => [unique().on(t.userId, t.locationId)],
);
