import { sql } from "drizzle-orm";
import { index, mysqlTable, varchar, timestamp, char, customType, serial, primaryKey, bigint } from "drizzle-orm/mysql-core";

/**
 * Geogprahic data type
 */
export const GEOGRAPHY_SRID = 4326

const point = customType<{
  data: { lat: number; lng: number } | null;
}>({
  dataType() {
    return 'POINT';
  },
  toDriver(value) {
    if (value) {
      // Return POINT as WKT (Well-Known Text) with SRID 4326
      return sql`ST_GeomFromText('POINT(${value.lng} ${value.lat})', ${GEOGRAPHY_SRID})`;
    }
    return value;
  },
  fromDriver(value) {
    if (value) {
      // Convert from MySQL POINT type to { lat, lng }
      const match = /^POINT\(([-\d.]+) ([-\d.]+)\)$/.exec(String(value));
      if (match) {
        return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
      }
    }
    return null;
  },
});


/**
 * Models
 */
export const usersTable = mysqlTable("users",{
  id: char('id', {length: 36}).primaryKey().default(sql`(UUID())`),
  name: varchar({ length: 255}).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow()
})

export const locationsTable = mysqlTable("locations", {
  id: serial().primaryKey(),
  coordinates: point('coordinates').notNull(),
  name: varchar('name', {length: 255}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow()
}, t => [
    index('coordinates_spatial_idx')
      .on(t.coordinates)
  ])

export const favorites = mysqlTable("favorites", {
  userId: char('user_id', {length: 36}).references(()=> usersTable.id),
  locationId: bigint('location_id', {mode: 'bigint', unsigned: true}).references(() => locationsTable.id),
  label: varchar('label', {length: 255}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow()
}, t=> [
    primaryKey({columns: [t.userId, t.locationId]})
  ])

