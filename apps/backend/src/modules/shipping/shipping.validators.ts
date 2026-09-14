import { z } from "zod";

export const shippingRateSchema = z.object({
  destination: z.object({
    city: z.string().min(1),
    region: z.string().optional(),
    country: z.string().min(2),
    postalCode: z.string().optional(),
  }),
  subtotalCents: z.number().int().nonnegative(),
});

export type ShippingRateInput = z.infer<typeof shippingRateSchema>;
