import { Router } from "express";
import { asyncHandler, requiredParam } from "../../lib/http.js";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  addWishlistItem,
  moveWishlistItemToCart,
  readWishlist,
  removeWishlistItem,
} from "./wishlist.service.js";
import { wishlistItemSchema } from "./wishlist.validators.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler<AuthenticatedRequest>(async (req, res) => {
    res.json(await readWishlist(req.user!.id));
  }),
);

router.post(
  "/items",
  validate(wishlistItemSchema),
  asyncHandler<AuthenticatedRequest>(async (req, res) => {
    res.status(201).json(await addWishlistItem(req.user!.id, req.body.productId));
  }),
);

router.delete(
  "/items/:productId",
  asyncHandler<AuthenticatedRequest>(async (req, res) => {
    res.json(await removeWishlistItem(req.user!.id, requiredParam(req, "productId")));
  }),
);

router.post(
  "/items/:productId/move-to-cart",
  asyncHandler<AuthenticatedRequest>(async (req, res) => {
    res.json(await moveWishlistItemToCart(req.user!.id, requiredParam(req, "productId")));
  }),
);

export default router;
