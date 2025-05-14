import { drizzle } from "drizzle-orm/mysql2";
import { env } from "../configs/env";
import * as schema from "./schema";
import mysql from "mysql2/promise";

const pool = mysql.createPool(env.DATABASE_URL);

export const db = drizzle(pool, { schema, mode: "default" });
