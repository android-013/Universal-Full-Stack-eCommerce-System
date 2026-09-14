import { HttpError } from "../../lib/http.js";
import { prisma } from "../../lib/prisma.js";
import type { AddCartItemInput, CartOwnerInput, SyncCartInput } from "./cart.validators.js";

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          images: { orderBy: { position: "asc" as const } },
          attributes: { include: { definition: true } },
          variants: true,
          inventoryItems: true,
        },
      },
      variant: true,
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

export async function readCart(owner: CartOwnerInput) {
  const cart = await findCart(owner);

  if (cart) {
    return cart;
  }

  return prisma.cart.create({
    data: {
      sessionId: owner.sessionId ?? null,
      ...(owner.userId ? { user: { connect: { id: owner.userId } } } : {}),
    },
    include: cartInclude,
  });
}

export async function addCartItem(input: AddCartItemInput) {
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    include: { variants: true },
  });

  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  if (input.variantId && !product.variants.some((variant) => variant.id === input.variantId)) {
    throw new HttpError(400, "Variant does not belong to product");
  }

  const cart = await readCart(input);
  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: input.productId,
      variantId: input.variantId ?? null,
    },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + input.quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cart: { connect: { id: cart.id } },
        product: { connect: { id: input.productId } },
        ...(input.variantId ? { variant: { connect: { id: input.variantId } } } : {}),
        quantity: input.quantity,
      },
    });
  }

  return readCart(input);
}

export async function updateCartItem(itemId: string, quantity: number) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item) {
    throw new HttpError(404, "Cart item not found");
  }

  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  return readCart(ownerFromCart(item.cart));
}

export async function removeCartItem(itemId: string) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item) {
    throw new HttpError(404, "Cart item not found");
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
  return readCart(ownerFromCart(item.cart));
}

export async function syncGuestCart(input: SyncCartInput) {
  const guestCart = await findCart({ sessionId: input.sessionId });
  const userCart = await readCart({ userId: input.userId });

  if (!guestCart || guestCart.id === userCart.id) {
    return userCart;
  }

  for (const item of guestCart.items) {
    await addCartItem({
      userId: input.userId,
      productId: item.productId,
      variantId: item.variantId ?? undefined,
      quantity: item.quantity,
    });
  }

  await prisma.cart.delete({ where: { id: guestCart.id } });
  return readCart({ userId: input.userId });
}

async function findCart(owner: CartOwnerInput) {
  const where = owner.userId
    ? { userId: owner.userId }
    : owner.sessionId
      ? { sessionId: owner.sessionId }
      : undefined;

  if (!where) {
    throw new HttpError(400, "Either userId or sessionId is required");
  }

  return prisma.cart.findFirst({
    where,
    include: cartInclude,
  });
}

function ownerFromCart(cart: { userId: string | null; sessionId: string | null }): CartOwnerInput {
  if (cart.userId) {
    return { userId: cart.userId };
  }

  if (cart.sessionId) {
    return { sessionId: cart.sessionId };
  }

  throw new HttpError(400, "Cart has no user or session owner");
}
