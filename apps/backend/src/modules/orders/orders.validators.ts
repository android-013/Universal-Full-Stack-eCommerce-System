import { z } from "zod";
import { orderStatuses } from "../../shared/order-state.js";

export const createOrderSchema = z.object({
  customerId: z.string().min(1).optional(),
  currency: z.string().length(3).default("USD"),
  shippingCents: z.number().int().nonnegative().default(0),
  taxCents: z.number().int().nonnegative().default(0),
  discountCents: z.number().int().nonnegative().default(0),
  addressSnapshot: z.record(z.string(), z.unknown()),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      variantId: z.string().min(1).optional(),
      quantity: z.number().int().positive(),
    }),
  ),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(orderStatuses),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
