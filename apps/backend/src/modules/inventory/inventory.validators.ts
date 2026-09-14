import { z } from "zod";

export const inventoryTransactionSchema = z.object({
  itemId: z.string().min(1),
  type: z.enum(["RECEIVED", "SOLD", "DAMAGED", "RETURNED", "ADJUSTED", "RESERVED", "RELEASED"]),
  quantity: z.number().int(),
  reason: z.string().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
});

export type InventoryTransactionInput = z.infer<typeof inventoryTransactionSchema>;
