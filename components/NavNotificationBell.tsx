import { getCurrentUser } from "@/lib/auth";
import { getUnreadCount } from "@/lib/notifications";
import NotificationBell from "./NotificationBell";

export default async function NavNotificationBell() {
  let userId = "";
  let count = 0;

  try {
    const user = await getCurrentUser();
    if (user) {
      userId = user.id;
      count = await getUnreadCount(user.id);
    }
  } catch {}

  if (!userId) return null;

  return <NotificationBell userId={userId} initialCount={count} />;
}