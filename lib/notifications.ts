import { prisma } from "@/lib/prisma";

export async function createNotification(
  userId: string,
  data: {
    type: string;
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