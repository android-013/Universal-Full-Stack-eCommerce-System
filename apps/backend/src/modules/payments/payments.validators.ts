import { z } from "zod";

export const paymentIntentSchema = z.object({
  orderId: z.string().min(1),
  provider: z.enum(["cash_on_delivery", "stripe", "sslcommerz", "paypal", "mobile"]),
});

export type PaymentIntentInput = z.infer<typeof paymentIntentSchema>;
