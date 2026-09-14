import { Router } from "express";
import { asyncHandler } from "../../lib/http.js";
import { requireAuth, requirePermission } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { queueNotification } from "./notifications.service.js";
import { notificationSchema } from "./notifications.validators.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requirePermission("notifications:manage"),
  validate(notificationSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await queueNotification(req.body));
  }),
);

export default router;
