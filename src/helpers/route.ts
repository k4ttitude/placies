import { Request, Response, RequestHandler, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { PlaciesError } from "../error";

export interface RouteOptions {
  params?: ZodSchema;
  query?: ZodSchema;
  body?: ZodSchema;
}

export interface AsyncRequestHandler<T, TParams, TResBody, TReqBody, TQuery> {
  (
    req: Request<TParams, TResBody, TReqBody, TQuery>,
    res: Response,
    next: NextFunction,
  ): T | PromiseLike<T>;
}

export type AsyncRequestHandlerFromOptions<
  TOptions extends RouteOptions,
  TResult,
> = AsyncRequestHandler<
  TResult,
  TOptions["params"] extends ZodSchema ? z.infer<TOptions["params"]> : unknown,
  unknown,
  TOptions["body"] extends ZodSchema ? z.infer<TOptions["body"]> : unknown,
  TOptions["query"] extends ZodSchema ? z.infer<TOptions["query"]> : unknown
>;

export function route<TOptions extends RouteOptions, TResult>(
  options: TOptions,
  handler: AsyncRequestHandlerFromOptions<TOptions, TResult>,
): RequestHandler[] {
  const validator = (req: Request, _res: Response, next: NextFunction) => {
    const { params, query, body } = options;
    const parseResult = z
      .object({
        params: params ?? z.any(),
        query: query ?? z.any(),
        body: body ?? z.any(),
      })
      .safeParse(req);

    if (!parseResult.success) {
      throw new PlaciesError(parseResult.error, 400);
    }
    const parsed = parseResult.data;

    // make req.query writable
    Object.defineProperty(req, "query", {
      ...Object.getOwnPropertyDescriptor(req, "query"),
      value: req.query,
      writable: true,
    });

    req.query = parsed.query;
    req.params = parsed.params;
    req.body = parsed.body;

    next();
  };

  const routeHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      // express does NOT catch async error
      next(err);
    }
  };

  return [validator, routeHandler];
}
