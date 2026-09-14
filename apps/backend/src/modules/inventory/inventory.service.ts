import { HttpError } from "../../lib/http.js";
import { prisma } from "../../lib/prisma.js";
import type { InventoryTransactionInput } from "./inventory.validators.js";

export async function listInventory() {
  return prisma.inventoryItem.findMany({
    include: {
      product: true,
      variant: true,
      warehouse: true,
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function appendInventoryTransaction(input: InventoryTransactionInput) {
  return prisma.$transaction(async (transaction) => {
    const item = await transaction.inventoryItem.findUnique({
      where: { id: input.itemId },
    });

    if (!item) {
      throw new HttpError(404, "Inventory item not found");
    }

    const nextQuantity = item.quantityOnHand + input.quantity;
    if (nextQuantity < 0) {
      throw new HttpError(409, "Inventory quantity cannot go below zero", {
        current: item.quantityOnHand,
        requestedDelta: input.quantity,
      });
    }

    const ledgerEntry = await transaction.inventoryTransaction.create({
      data: {
        itemId: input.itemId,
        type: input.type,
        quantity: input.quantity,
        reason: input.reason ?? null,
        referenceType: input.referenceType ?? null,
        referenceId: input.referenceId ?? null,
      },
    });

    const updatedItem = await transaction.inventoryItem.update({
      where: { id: item.id },
      data: {
        quantityOnHand: nextQuantity,
      },
      include: {
        product: true,
        variant: true,
        warehouse: true,
      },
    });

    return {
      item: updatedItem,
      transaction: ledgerEntry,
      lowStock: updatedItem.quantityOnHand <= updatedItem.lowStockThreshold,
    };
  });
}
