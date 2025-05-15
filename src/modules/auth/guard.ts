import { Request } from "express";
import passport, { DoneCallback } from "passport";
import { Strategy as HeaderStrategy } from "passport-http-header-strategy";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import { PlaciesError } from "../../error";
import { tryCatch } from "../../helpers/try-catch";

export const APIKEY_HEADER = "X-PLACIES-TOKEN";

passport.use(
  new HeaderStrategy(
    { header: APIKEY_HEADER, passReqToCallback: true },
    async function (_req: Request, token: string, done: DoneCallback) {
      const [user, error] = await tryCatch(
        db.query.users.findFirst({
          where: eq(users.id, Number(token)),
        }),
      );
      if (error) {
        done(new PlaciesError(error));
      }
      if (!user) {
        // throw 401 Unauthorized automatically
        return done(null, false);
      }
      return done(null, user);
    },
  ),
);

export const apikeyAuth = passport.authenticate("header", { session: false });
