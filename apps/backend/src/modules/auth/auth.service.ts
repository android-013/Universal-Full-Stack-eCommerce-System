import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";
import { HttpError } from "../../lib/http.js";
import { prisma } from "../../lib/prisma.js";
import type { LoginInput, RegisterInput } from "./auth.validators.js";

const refreshTokenDays = 30;

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });

  if (existing) {
    throw new HttpError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const customerRole = await prisma.role.upsert({
    where: { name: "Customer" },
    update: {},
    create: { name: "Customer", description: "Customer account access" },
  });

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
      status: "ACTIVE",
      roles: {
        create: {
          roleId: customerRole.id,
        },
      },
    },
  });

  return issueTokenPair(user.id);
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user || user.status !== "ACTIVE") {
    throw new HttpError(401, "Invalid credentials");
  }

  const validPassword = await bcrypt.compare(input.password, user.passwordHash);

  if (!validPassword) {
    throw new HttpError(401, "Invalid credentials");
  }

  return issueTokenPair(user.id);
}

export async function refresh(refreshToken: string) {
  const [userId] = refreshToken.split(".");

  if (!userId) {
    throw new HttpError(401, "Invalid refresh token");
  }

  const records = await prisma.refreshToken.findMany({
    where: {
      userId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  for (const record of records) {
    const matches = await bcrypt.compare(refreshToken, record.tokenHash);
    if (!matches) {
      continue;
    }

    await prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    return issueTokenPair(userId);
  }

  throw new HttpError(401, "Invalid refresh token");
}

export async function readSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles.map((entry) => entry.role.name),
    permissions: [
      ...new Set(
        user.roles.flatMap((entry) =>
          entry.role.permissions.map((permissionEntry) => permissionEntry.permission.key),
        ),
      ),
    ],
  };
}

async function issueTokenPair(userId: string) {
  const signOptions: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as NonNullable<SignOptions["expiresIn"]>,
  };
  const accessToken = jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, signOptions);

  const refreshToken = `${userId}.${crypto.randomBytes(48).toString("base64url")}`;
  const tokenHash = await bcrypt.hash(refreshToken, 12);
  const expiresAt = new Date(Date.now() + refreshTokenDays * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken,
    user: await readSession(userId),
  };
}
