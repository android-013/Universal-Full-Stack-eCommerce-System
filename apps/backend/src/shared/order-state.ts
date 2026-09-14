import { HttpError } from "../lib/http.js";

export const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
  "REFUNDED",
] as const;

export type OrderStatusValue = (typeof orderStatuses)[number];

export const orderTransitions: Record<OrderStatusValue, OrderStatusValue[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: ["REFUNDED"],
  RETURNED: ["REFUNDED"],
  REFUNDED: [],
};

export function assertOrderTransition(current: string, next: string) {
  const currentStatus = current as OrderStatusValue;
  const nextStatus = next as OrderStatusValue;

  if (!orderStatuses.includes(currentStatus) || !orderStatuses.includes(nextStatus)) {
    throw new HttpError(400, "Unknown order status", { current, next });
  }

  if (!orderTransitions[currentStatus].includes(nextStatus)) {
    throw new HttpError(409, "Invalid order status transition", {
      current,
      next,
      allowed: orderTransitions[currentStatus],
    });
  }
}
