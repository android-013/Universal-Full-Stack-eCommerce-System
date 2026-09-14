import { HttpError } from "../../lib/http.js";
import { prisma } from "../../lib/prisma.js";
import { assertOrderTransition } from "../../shared/order-state.js";
import type { CreateOrderInput } from "./orders.validators.js";

export async function listOrders() {
  return prisma.order.findMany({
    include: {
      customer: true,
      items: true,
      payments: true,
      shipments: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createOrder(input: CreateOrderInput) {
  if (!input.items.length) {
    throw new HttpError(400, "Order requires at least one item");
  }

  return prisma.$transaction(async (transaction) => {
    const orderItems = [];
    let subtotalCents = 0;

    for (const item of input.items) {
      const product = await transaction.product.findUnique({
        where: { id: item.productId },
        include: {
          variants: true,
        },
      });

      if (!product) {
        throw new HttpError(404, "Product not found", { productId: item.productId });
      }

      const variant = item.variantId
        ? product.variants.find((candidate) => candidate.id === item.variantId)
        : undefined;
      const unitPriceCents = variant?.priceCents ?? product.basePriceCents;
      subtotalCents += unitPriceCents * item.quantity;

      orderItems.push({
        product: {
          connect: { id: product.id },
        },
        ...(variant ? { variant: { connect: { id: variant.id } } } : {}),
        title: variant ? `${product.title} - ${variant.title}` : product.title,
        sku: variant?.sku ?? null,
        quantity: item.quantity,
        unitPriceCents,
      });
    }

    const totalCents =
      subtotalCents + input.shippingCents + input.taxCents - input.discountCents;

    return transaction.order.create({
      data: {
        orderNumber: `UCP-${Date.now()}`,
        ...(input.customerId ? { customer: { connect: { id: input.customerId } } } : {}),
        currency: input.currency,
        subtotalCents,
        shippingCents: input.shippingCents,
        taxCents: input.taxCents,
        discountCents: input.discountCents,
        totalCents,
        addressSnapshotJson: JSON.stringify(input.addressSnapshot),
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        payments: true,
        shipments: true,
      },
    });
  });
}

export async function updateOrderStatus(id: string, status: string) {
  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) {
    throw new HttpError(404, "Order not found");
  }

  assertOrderTransition(order.status, status);

  return prisma.order.update({
    where: { id },
    data: { status: status as typeof order.status },
    include: {
      items: true,
      payments: true,
      shipments: true,
    },
  });
}
