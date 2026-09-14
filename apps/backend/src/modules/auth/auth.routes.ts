import { Router } from "express";
import { asyncHandler } from "../../lib/http.js";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { login, readSession, refresh, register } from "./auth.service.js";
import { loginSchema, refreshSchema, registerSchema } from "./auth.validators.js";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const result = await register(req.body);
    res.status(201).json(result);
  }),
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await login(req.body);
    res.json(result);
  }),
);

router.post(
  "/refresh",
  validate(refreshSchema),
  asyncHandler(async (req, res) => {
    const result = await refresh(req.body.refreshToken);
    res.json(result);
  }),
);

router.get(
  "/me",
  requireAuth,
  asyncHandler<AuthenticatedRequest>(async (req, res) => {
    res.json(await readSession(req.user!.id));
  }),
);

export default router;
