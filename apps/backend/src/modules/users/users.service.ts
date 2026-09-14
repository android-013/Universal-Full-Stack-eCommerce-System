import { HttpError } from "../../lib/http.js";
import { prisma } from "../../lib/prisma.js";

export async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      status: true,
      createdAt: true,
      roles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function readUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      status: true,
      addresses: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      roles: {
        include: { role: true },
      },
    },
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return user;
}

export async function assignRoles(userId: string, roleIds: string[]) {
  await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  return prisma.$transaction(async (transaction) => {
    await transaction.userRole.deleteMany({ where: { userId } });
    await transaction.userRole.createMany({
      data: roleIds.map((roleId) => ({ userId, roleId })),
    });

    return readUser(userId);
  });
}
