import { z } from "zod";

export const analyticsEventSchema = z.object({
  eventType: z.string().min(1),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  productId: z.string().optional(),
  orderId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
