import { Router } from "express";
import { asyncHandler } from "../../lib/http.js";
import { requireAuth, requirePermission } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createPaymentIntent } from "./payments.service.js";
import { paymentIntentSchema } from "./payments.validators.js";

const router = Router();

router.post(
  "/intent",
  requireAuth,
  requirePermission("payments:manage"),
  validate(paymentIntentSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await createPaymentIntent(req.body));
  }),
);

export default router;
