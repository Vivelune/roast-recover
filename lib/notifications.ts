import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "order_placed"
  | "deposit_confirmed"
  | "balance_due"
  | "balance_confirmed"
  | "order_status"
  | "order_shipped"
  | "order_delivered"
  | "review_request"
  | "service_ticket"
  | "referral_credit"
  | "subscription_active"
  | "subscription_canceled"
  | "warranty_expiring";

export async function createNotification(
  userId: string,
  data: {
    type: NotificationType;
    title: string;
    body: string;
    href?: string;
  }
) {
  return prisma.notification.create({
    data: { userId, ...data },
  });
}

export async function createActivityEntry(
  userId: string,
  data: {
    type: string;
    title: string;
    metadata?: Record<string, any>;
  }
) {
  return prisma.activityEntry.create({
    data: { userId, ...data, metadata: data.metadata ?? {} },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

// Fire both notification + activity entry together
export async function notifyAndLog(
  userId: string,
  notification: {
    type: NotificationType;
    title: string;
    body: string;
    href?: string;
  },
  activity?: {
    type: string;
    title: string;
    metadata?: Record<string, any>;
  }
) {
  await createNotification(userId, notification);
  if (activity) {
    await createActivityEntry(userId, activity);
  }
}