import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";

export type AuthenticatedUser = {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

export async function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

    if (!token) {
      next(new HttpError(401, "Authentication required"));
      return;
    }

    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const userId = typeof payload === "object" && payload.sub ? String(payload.sub) : undefined;

    if (!userId) {
      next(new HttpError(401, "Invalid access token"));
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.status !== "ACTIVE") {
      next(new HttpError(401, "User is not active"));
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      roles: user.roles.map((entry) => entry.role.name),
      permissions: [
        ...new Set(
          user.roles.flatMap((entry) =>
            entry.role.permissions.map((permissionEntry) => permissionEntry.permission.key),
          ),
        ),
      ],
    };

    next();
  } catch (error) {
    next(error instanceof Error ? new HttpError(401, "Invalid access token") : error);
  }
}

export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new HttpError(401, "Authentication required"));
      return;
    }

    if (!req.user.permissions.includes(permission)) {
      next(new HttpError(403, "Permission denied", { permission }));
      return;
    }

    next();
  };
}
