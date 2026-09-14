import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { HttpError } from "../lib/http.js";

type RequestSource = "body" | "query" | "params";

export function validate(schema: ZodType, source: RequestSource = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(new HttpError(400, "Validation failed", result.error.flatten()));
      return;
    }

    req[source] = result.data;
    next();
  };
}
