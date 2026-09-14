import { Router } from "express";
import { asyncHandler, requiredParam } from "../../lib/http.js";
import { requireAuth, requirePermission } from "../../middleware/auth.js";
import { generateProductSeoDraft } from "./seo.service.js";

const router = Router();

router.post(
  "/products/:productId/drafts",
  requireAuth,
  requirePermission("seo:manage"),
  asyncHandler(async (req, res) => {
    res.status(201).json(await generateProductSeoDraft(requiredParam(req, "productId")));
  }),
);

export default router;
