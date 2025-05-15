import { and, count, eq, like, or, SQL, sql } from "drizzle-orm";
import { db } from "../../db";
import { favorites, locations } from "../../db/schema";
import {
  CreateFavoriteBody,
  FindManyFavoritesQuery,
  FindManyFavoritesResponse,
  UpdateFavoriteBody,
} from "./dto";
import { Id } from "../common/dto";
import { PlaciesError } from "../../error";

export async function findManyFavorties(
  userId: Id,
  query: FindManyFavoritesQuery,
): Promise<FindManyFavoritesResponse> {
  const { q, limit, offset } = query;

  const conditions: (SQL<unknown> | undefined)[] = [
    eq(favorites.userId, userId),
  ];
  if (q) {
    const lowerCaseQ = `%${q.toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`LOWER(${favorites.label})`, lowerCaseQ),
        like(sql`LOWER(${locations.name})`, lowerCaseQ),
      ),
    );
  }

  const results = await db
    .select()
    .from(favorites)
    .leftJoin(locations, eq(favorites.locationId, locations.id))
    .where(and(...conditions))
    .offset(offset)
    .limit(limit);

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(favorites)
    .leftJoin(locations, eq(favorites.locationId, locations.id))
    .where(and(...conditions));

  return {
    results: results.map(({ favorites, locations }) => ({
      ...favorites,
      location: locations,
    })),
    pagination: { total, limit, offset },
  };
}

async function findFavorite(userId: Id, id: Id) {
  const query = db.query.favorites.findFirst({
    where: and(eq(favorites.userId, userId), eq(favorites.id, id)),
  });

  const userFavorite = await query;
  if (!userFavorite) {
    throw new PlaciesError("Favorite not found", 404);
  }

  return userFavorite;
}

export async function createFavorite(userId: Id, data: CreateFavoriteBody) {
  const [{ id }] = await db
    .insert(favorites)
    .values({ ...data, userId })
    .$returningId();

  const inserted = await db.query.favorites.findFirst({
    where: eq(favorites.id, id),
  });

  return inserted;
}

export async function updateFavorite(
  userId: Id,
  id: Id,
  data: UpdateFavoriteBody,
) {
  console.log({ userId });
  await findFavorite(userId, id);

  await db.update(favorites).set(data).where(eq(favorites.id, id));

  const updated = await db.query.favorites.findFirst({
    where: eq(favorites.id, id),
  });

  return updated;
}

export async function removeFavorite(userId: Id, id: Id) {
  await findFavorite(userId, id);

  return db.delete(favorites).where(eq(favorites.id, id));
}
