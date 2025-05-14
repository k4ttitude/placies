import type { User as DbUser } from "./src/db/models.ts";

declare global {
  namespace Express {
    type User = DbUser;
  }
}
