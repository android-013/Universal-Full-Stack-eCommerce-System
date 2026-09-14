import { Router } from "express";
import { asyncHandler, requiredParam } from "../../lib/http.js";
import { validate } from "../../middleware/validate.js";
import { addCartItem, readCart, removeCartItem, syncGuestCart, updateCartItem } from "./cart.service.js";
import { addCartItemSchema, cartOwnerSchema, syncCartSchema, updateCartItemSchema } from "./cart.validators.js";

const router = Router();

router.get(
  "/",
  validate(cartOwnerSchema, "query"),
  asyncHandler(async (req, res) => {
    res.json(await readCart(req.query));
  }),
);

router.post(
  "/items",
  validate(addCartItemSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await addCartItem(req.body));
  }),
);

router.patch(
  "/items/:id",
  validate(updateCartItemSchema),
  asyncHandler(async (req, res) => {
    res.json(await updateCartItem(requiredParam(req, "id"), req.body.quantity));
  }),
);

router.delete(
  "/items/:id",
  asyncHandler(async (req, res) => {
    res.json(await removeCartItem(requiredParam(req, "id")));
  }),
);

router.post(
  "/sync",
  validate(syncCartSchema),
  asyncHandler(async (req, res) => {
    res.json(await syncGuestCart(req.body));
  }),
);

export default router;
