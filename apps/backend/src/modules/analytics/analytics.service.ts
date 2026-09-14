import { prisma } from "../../lib/prisma.js";
import type { AnalyticsEventInput } from "./analytics.validators.js";

export async function recordEvent(input: AnalyticsEventInput) {
  return prisma.analyticsEvent.create({
    data: {
      eventType: input.eventType,
      userId: input.userId ?? null,
      sessionId: input.sessionId ?? null,
      productId: input.productId ?? null,
      orderId: input.orderId ?? null,
      metadataJson: JSON.stringify(input.metadata),
    },
  });
}

export async function readDashboardMetrics() {
  const [orders, customers, products, events] = await Promise.all([
    prisma.order.findMany(),
    prisma.user.count(),
    prisma.product.count(),
    prisma.analyticsEvent.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  return {
    revenueCents: orders.reduce((sum, order) => sum + order.totalCents, 0),
    orderCount: orders.length,
    customerCount: customers,
    productCount: products,
    recentEvents: events,
  };
}
