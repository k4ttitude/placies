import { and, eq, ilike } from "drizzle-orm";
import { db } from "../../db";
import { favorites, locations, users } from "../../db/schema";
import { User } from "../../db/models";
import {
  CreateFavoriteBody,
  FindManyFavoritesQuery,
  UpdateFavoriteBody,
} from "./dto";
import { Id } from "../common/dto";
import { PlaciesError } from "../../error";

export function findManyFavorties(
  userId: User["id"],
  query: FindManyFavoritesQuery,
) {
  const conditions = [eq(favorites.userId, userId)];
  if (query.q) {
    conditions.push(ilike(favorites.label, query.q));
    conditions.push(ilike(locations.name, query.q));
  }

  return db.query.favorites.findMany({
    where: and(...conditions),
    limit: query.limit,
    offset: query.offset,
  });
}

async function findFavorite(userId: User["id"], id: Id) {
  const userFavorite = await db.query.favorites.findFirst({
    where: and(eq(users.id, userId), eq(favorites.locationId, id)),
  });

  if (!userFavorite) {
    throw new PlaciesError("Favorite not found", 404);
  }

  return userFavorite;
}

export async function createFavorite(
  userId: User["id"],
  data: CreateFavoriteBody,
) {
  const [ids] = await db
    .insert(favorites)
    .values({ ...data, userId })
    .$returningId();

  return ids;
}

export async function updateFavorite(
  userId: User["id"],
  id: Id,
  data: UpdateFavoriteBody,
) {
  await findFavorite(userId, id);

  await db
    .update(favorites)
    .set({
      ...data,
      locationId:
        typeof data.locationId === "bigint" ? data.locationId : undefined,
      userId,
    })
    .where(eq(favorites.locationId, id));

  const updated = await db.query.favorites.findFirst({
    where: eq(favorites.locationId, id),
  });

  return updated;
}

export async function removeFavorite(userId: User["id"], id: Id) {
  await findFavorite(userId, id);

  return db.delete(favorites).where(eq(favorites.locationId, id));
}
