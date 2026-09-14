import { z } from "zod";

export const cartOwnerSchema = z
  .object({
    userId: z.string().min(1).optional(),
    sessionId: z.string().min(1).optional(),
  })
  .refine((value) => value.userId || value.sessionId, {
    message: "Either userId or sessionId is required",
  });

export const addCartItemSchema = cartOwnerSchema.extend({
  productId: z.string().min(1),
  variantId: z.string().min(1).optional(),
  quantity: z.number().int().positive(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0),
});

export const syncCartSchema = z.object({
  userId: z.string().min(1),
  sessionId: z.string().min(1),
});

export type CartOwnerInput = z.infer<typeof cartOwnerSchema>;
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type SyncCartInput = z.infer<typeof syncCartSchema>;
