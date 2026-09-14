import { Router } from "express";
import { asyncHandler, requiredParam } from "../../lib/http.js";
import { requireAuth, requirePermission } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import type { AttributeFilter } from "../../shared/search.js";
import { createProduct, listProducts, readProductBySlug } from "./products.service.js";
import { createProductSchema } from "./products.validators.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filters: AttributeFilter[] = Object.entries(req.query)
      .flatMap(([key, value]) => {
        const textValue = Array.isArray(value) ? value[0] : value;
        if (typeof textValue !== "string") return [];

        if (key.startsWith("attr.")) {
          return [{ key: key.slice("attr.".length), value: textValue }];
        }

        if (key.startsWith("exclude.")) {
          return [{ key: key.slice("exclude.".length), value: textValue, exclude: true }];
        }

        return [];
      });

    res.json(
      await listProducts({
        query: typeof req.query.q === "string" ? req.query.q : undefined,
        status:
          req.query.status === "DRAFT" || req.query.status === "ACTIVE" || req.query.status === "ARCHIVED"
            ? req.query.status
            : "ACTIVE",
        filters,
      }),
    );
  }),
);

router.post(
  "/",
  requireAuth,
  requirePermission("products:manage"),
  validate(createProductSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await createProduct(req.body));
  }),
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    res.json(await readProductBySlug(requiredParam(req, "slug")));
  }),
);

export default router;
