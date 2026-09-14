import { Router } from "express";
import { asyncHandler, requiredParam } from "../../lib/http.js";
import { requireAuth, requirePermission } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createOrder, listOrders, updateOrderStatus } from "./orders.service.js";
import { createOrderSchema, updateOrderStatusSchema } from "./orders.validators.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requirePermission("orders:manage"),
  asyncHandler(async (_req, res) => {
    res.json(await listOrders());
  }),
);

router.post(
  "/",
  validate(createOrderSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await createOrder(req.body));
  }),
);

router.patch(
  "/:id/status",
  requireAuth,
  requirePermission("orders:manage"),
  validate(updateOrderStatusSchema),
  asyncHandler(async (req, res) => {
    res.json(await updateOrderStatus(requiredParam(req, "id"), req.body.status));
  }),
);

export default router;
