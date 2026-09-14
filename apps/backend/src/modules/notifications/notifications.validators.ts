import { z } from "zod";

export const notificationSchema = z.object({
  userId: z.string().optional(),
  channel: z.enum(["EMAIL", "SMS", "PUSH"]),
  recipient: z.string().min(1),
  templateKey: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export type NotificationInput = z.infer<typeof notificationSchema>;
