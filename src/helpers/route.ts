import { Request, Response, RequestHandler, NextFunction } from "express";
import { z, ZodSchema } from "zod";

export interface AsyncHandler<T, TParams, TResBody, TReqBody, TQuery> {
  (
    req: Request<TParams, TResBody, TReqBody, TQuery>,
    res: Response,
    next: NextFunction,
  ): PromiseLike<T>;
}

export interface RouteOptions {
  params?: ZodSchema;
  query?: ZodSchema;
  body?: ZodSchema;
}

export function route<TOptions extends RouteOptions, TResult>(
  options: TOptions,
  handler: AsyncHandler<
    TResult,
    TOptions["params"] extends ZodSchema
      ? z.infer<TOptions["params"]>
      : unknown,
    unknown,
    TOptions["body"] extends ZodSchema ? z.infer<TOptions["body"]> : unknown,
    TOptions["query"] extends ZodSchema ? z.infer<TOptions["query"]> : unknown
  >,
): RequestHandler[] {
  const validator = (req: Request, res: Response, next: NextFunction) => {
    const { params, query, body } = options;
    const parseResult = z
      .object({
        params: params ?? z.any(),
        query: query ?? z.any(),
        body: body ?? z.any(),
      })
      .safeParse(req);

    if (!parseResult.success) {
      res.status(400).send(parseResult.error.issues);
      // next(parseResult.error);
      return;
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

    console.log(req.query, parsed.query);
    next();
  };

  const routeHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    await handler(req, res, next);
  };

  return [validator, routeHandler];
}
