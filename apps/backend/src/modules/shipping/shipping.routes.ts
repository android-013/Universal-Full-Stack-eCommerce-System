import { Router } from "express";
import { asyncHandler } from "../../lib/http.js";
import { validate } from "../../middleware/validate.js";
import { quoteShipping } from "./shipping.service.js";
import { shippingRateSchema } from "./shipping.validators.js";

const router = Router();

router.post(
  "/rates",
  validate(shippingRateSchema),
  asyncHandler(async (req, res) => {
    res.json(await quoteShipping(req.body));
  }),
);

export default router;
