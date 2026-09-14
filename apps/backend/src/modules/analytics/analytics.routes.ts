import { Router } from "express";
import { asyncHandler } from "../../lib/http.js";
import { requireAuth, requirePermission } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { readDashboardMetrics, recordEvent } from "./analytics.service.js";
import { analyticsEventSchema } from "./analytics.validators.js";

const router = Router();

router.post(
  "/events",
  validate(analyticsEventSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await recordEvent(req.body));
  }),
);

router.get(
  "/dashboard",
  requireAuth,
  requirePermission("analytics:read"),
  asyncHandler(async (_req, res) => {
    res.json(await readDashboardMetrics());
  }),
);

export default router;
