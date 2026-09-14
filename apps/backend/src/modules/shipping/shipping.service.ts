import type { ShippingRateInput } from "./shipping.validators.js";

export async function quoteShipping(input: ShippingRateInput) {
  const localDelivery = input.destination.country.toUpperCase() === "US" ? 799 : 1999;
  const freeShipping = input.subtotalCents >= 10000;

  return {
    rates: [
      {
        provider: "local_delivery",
        service: "Standard",
        amountCents: freeShipping ? 0 : localDelivery,
        currency: "USD",
        estimatedDays: freeShipping ? 5 : 3,
      },
      {
        provider: "manual_delivery",
        service: "Manual Quote",
        amountCents: 0,
        currency: "USD",
        estimatedDays: null,
        requiresReview: true,
      },
    ],
  };
}
