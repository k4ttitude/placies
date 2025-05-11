import { date, geometry, index, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users",{
  id: uuid().primaryKey(),
  name: varchar({ length: 255}).notNull(),
  createdAt: date("created_at").notNull().defaultNow(),
  updatedAt: date("updated_at").notNull().defaultNow()
})

const GEOGRAPHY_SRID = 4326
export const locationsTable = pgTable("locations", {
  id: uuid().primaryKey(),
  location: geometry('location', {type: 'point', mode: 'xy', srid: GEOGRAPHY_SRID }).notNull(),
  name: varchar(),
  tags: varchar().array(),
  createdAt: date("created_at").notNull().defaultNow(),
  updatedAt: date("updated_at").notNull().defaultNow()
}, t => [index('spatial_location_index').using('gist', t.location)])

export const favorites = pgTable("favorites", {
  userId: uuid("user_id").references(() => usersTable.id),
  locationId: uuid("location_id").references(() => locationsTable.id),
  label: varchar(),
  createdAt: date("created_at").notNull().defaultNow(),
  updatedAt: date("updated_at").notNull().defaultNow()
})
