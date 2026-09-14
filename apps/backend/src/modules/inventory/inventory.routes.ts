import { Router } from "express";
import { asyncHandler } from "../../lib/http.js";
import { requireAuth, requirePermission } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { appendInventoryTransaction, listInventory } from "./inventory.service.js";
import { inventoryTransactionSchema } from "./inventory.validators.js";

const router = Router();

router.use(requireAuth, requirePermission("inventory:manage"));

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await listInventory());
  }),
);

router.post(
  "/transactions",
  validate(inventoryTransactionSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await appendInventoryTransaction(req.body));
  }),
);

export default router;
