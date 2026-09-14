import { HttpError } from "../../lib/http.js";
import { prisma } from "../../lib/prisma.js";
import type { PaymentIntentInput } from "./payments.validators.js";

type PaymentProvider = {
  key: PaymentIntentInput["provider"];
  createIntent(input: { orderId: string; amountCents: number; currency: string }): Promise<{
    providerRef?: string;
    status: "PENDING" | "AUTHORIZED";
    metadata: Record<string, unknown>;
  }>;
};

const providers: Record<PaymentIntentInput["provider"], PaymentProvider> = {
  cash_on_delivery: {
    key: "cash_on_delivery",
    async createIntent() {
      return {
        status: "PENDING",
        metadata: { settlement: "collect_on_delivery" },
      };
    },
  },
  stripe: notConfiguredProvider("stripe"),
  sslcommerz: notConfiguredProvider("sslcommerz"),
  paypal: notConfiguredProvider("paypal"),
  mobile: notConfiguredProvider("mobile"),
};

export async function createPaymentIntent(input: PaymentIntentInput) {
  const order = await prisma.order.findUnique({ where: { id: input.orderId } });

  if (!order) {
    throw new HttpError(404, "Order not found");
  }

  const intent = await providers[input.provider].createIntent({
    orderId: order.id,
    amountCents: order.totalCents,
    currency: order.currency,
  });

  return prisma.payment.create({
    data: {
      orderId: order.id,
      provider: input.provider,
      status: intent.status,
      amountCents: order.totalCents,
      currency: order.currency,
      providerRef: intent.providerRef ?? null,
      metadataJson: JSON.stringify(intent.metadata),
    },
  });
}

function notConfiguredProvider(key: PaymentIntentInput["provider"]): PaymentProvider {
  return {
    key,
    async createIntent() {
      throw new HttpError(501, `${key} payment provider is not configured`);
    },
  };
}
