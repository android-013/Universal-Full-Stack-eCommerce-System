import { Router } from "express";
import { asyncHandler } from "../../lib/http.js";
import { requireAuth, requirePermission } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createCategory, listCategoryTree } from "./categories.service.js";
import { createCategorySchema } from "./categories.validators.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await listCategoryTree());
  }),
);

router.post(
  "/",
  requireAuth,
  requirePermission("products:manage"),
  validate(createCategorySchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await createCategory(req.body));
  }),
);

export default router;
