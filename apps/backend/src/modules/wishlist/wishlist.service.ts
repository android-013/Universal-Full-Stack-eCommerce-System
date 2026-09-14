import { HttpError } from "../../lib/http.js";
import { addCartItem } from "../cart/cart.service.js";
import { prisma } from "../../lib/prisma.js";

const wishlistInclude = {
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
    },
    orderBy: { createdAt: "desc" as const },
  },
};

export async function readWishlist(userId: string) {
  return prisma.wishlist.upsert({
    where: { userId },
    update: {},
    create: {
      user: {
        connect: { id: userId },
      },
    },
    include: wishlistInclude,
  });
}

export async function addWishlistItem(userId: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  const wishlist = await readWishlist(userId);

  await prisma.wishlistItem.upsert({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId,
      },
    },
    update: {},
    create: {
      wishlist: { connect: { id: wishlist.id } },
      product: { connect: { id: productId } },
    },
  });

  return readWishlist(userId);
}

export async function removeWishlistItem(userId: string, productId: string) {
  const wishlist = await readWishlist(userId);

  await prisma.wishlistItem.deleteMany({
    where: {
      wishlistId: wishlist.id,
      productId,
    },
  });

  return readWishlist(userId);
}

export async function moveWishlistItemToCart(userId: string, productId: string) {
  await addWishlistItem(userId, productId);
  await addCartItem({ userId, productId, quantity: 1 });
  return removeWishlistItem(userId, productId);
}
