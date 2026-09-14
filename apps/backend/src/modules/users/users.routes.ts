import { Router } from "express";
import { z } from "zod";
import { asyncHandler, requiredParam } from "../../lib/http.js";
import { requireAuth, requirePermission } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { assignRoles, listUsers, readUser } from "./users.service.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  requirePermission("users:read"),
  asyncHandler(async (_req, res) => {
    res.json(await listUsers());
  }),
);

router.get(
  "/:id",
  requirePermission("users:read"),
  asyncHandler(async (req, res) => {
    res.json(await readUser(requiredParam(req, "id")));
  }),
);

router.patch(
  "/:id/roles",
  requirePermission("users:manage"),
  validate(z.object({ roleIds: z.array(z.string().min(1)) })),
  asyncHandler(async (req, res) => {
    res.json(await assignRoles(requiredParam(req, "id"), req.body.roleIds));
  }),
);

export default router;
