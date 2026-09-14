import { prisma } from "../../lib/prisma.js";
import type { NotificationInput } from "./notifications.validators.js";

export async function queueNotification(input: NotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId ?? null,
      channel: input.channel,
      recipient: input.recipient,
      templateKey: input.templateKey,
      payloadJson: JSON.stringify(input.payload),
    },
  });
}
