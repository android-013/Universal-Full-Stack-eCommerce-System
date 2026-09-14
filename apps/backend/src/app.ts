import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { openApiSpec } from "./config/openapi.js";
import { errorHandler } from "./lib/http.js";
import analyticsRouter from "./modules/analytics/analytics.routes.js";
import authRouter from "./modules/auth/auth.routes.js";
import cartRouter from "./modules/cart/cart.routes.js";
import categoriesRouter from "./modules/categories/categories.routes.js";
import inventoryRouter from "./modules/inventory/inventory.routes.js";
import notificationsRouter from "./modules/notifications/notifications.routes.js";
import ordersRouter from "./modules/orders/orders.routes.js";
import paymentsRouter from "./modules/payments/payments.routes.js";
import productsRouter from "./modules/products/products.routes.js";
import seoRouter from "./modules/seo/seo.routes.js";
import shippingRouter from "./modules/shipping/shipping.routes.js";
import usersRouter from "./modules/users/users.routes.js";
import wishlistRouter from "./modules/wishlist/wishlist.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/categories", categoriesRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/wishlist", wishlistRouter);
  app.use("/api/inventory", inventoryRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/payments", paymentsRouter);
  app.use("/api/shipping", shippingRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/seo", seoRouter);
  app.use("/api/notifications", notificationsRouter);

  app.use(errorHandler);

  return app;
}
