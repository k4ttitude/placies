import { db } from "../../db";

export function getUsers() {
  return db.query.users.findMany();
}
