import { NextFunction, Request, Response } from "express";
import { env } from "./configs/env";

export class PlaciesError extends Error {
  status: number;

  constructor(input: string | Error | object, status: number = 500) {
    if (typeof input === "string") {
      super(input);
    } else if (input instanceof Error) {
      super(input.message);
      this.stack = input.stack;
    } else {
      super(JSON.stringify(input));
    }

    Object.setPrototypeOf(this, PlaciesError.prototype);

    this.name = this.constructor.name;

    this.status = status;
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(err);

  const status = err instanceof PlaciesError ? err.status : 500;
  const message = err.message ?? "Internal Server Error";

  res.status(status).json({
    error: {
      message,
      ...(env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
}
