"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: string;
};

export default function NotificationBell({
  userId,
  initialCount,
}: {
  userId: string;
  initialCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // Fallback or quiet catch
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    await fetch("/api/notifications/read", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  async function markOneRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  function handleOpen() {
    const nextState = !open;
    setOpen(nextState);
    if (nextState) fetchNotifications();
  }

  const typeIcon: Record<string, string> = {
    order_status: "📦",
    balance_due: "💳",
    service_ticket: "🔧",
    referral_credit: "🎁",
    review_request: "⭐",
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={handleOpen}
        className="relative p-2 text-ash hover:text-char transition-colors rounded-lg hover:bg-steam/40"
        aria-label="Notifications"
      >
        <Bell size={18} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ember rounded-full ring-2 ring-white animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            /* 
              Responsive Dropdown Menu Positioning: 
              - On Desktop (md:left-0 md:right-auto): Aligns drop with left of button inside sidebar
              - On Mobile (right-0 left-auto): Snaps inside screen bounds on the right edge
            */
            className="absolute right-0 left-auto md:left-0 md:right-auto top-full mt-2 w-80 sm:w-85 bg-white border border-border rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[#FBFBFA]">
              <p className="text-sm font-semibold text-char">Notifications</p>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-ember font-semibold hover:underline flex items-center gap-1"
                >
                  <Check size={12} /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
              {loading ? (
                <div className="px-4 py-8 text-center text-ash text-sm font-medium">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell
                    size={24}
                    className="text-ash/50 mx-auto mb-2"
                    strokeWidth={1.5}
                  />
                  <p className="text-ash text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const inner = (
                    <div
                      className={`px-4 py-3 hover:bg-steam/20 transition-colors cursor-pointer ${
                        !n.read ? "bg-ember/[0.02]" : ""
                      }`}
                      onClick={() => !n.read && markOneRead(n.id)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-base shrink-0 mt-0.5">
                          {typeIcon[n.type] ?? "🔔"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm tracking-tight leading-snug ${
                              !n.read
                                ? "font-semibold text-char"
                                : "text-ash"
                            }`}
                          >
                            {n.title}
                          </p>
                          <p className="text-xs text-ash mt-0.5 leading-relaxed">
                            {n.body}
                          </p>
                          <p className="text-[10px] text-ash/50 mt-1.5 font-medium">
                            {new Date(n.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                        {!n.read && (
                          <div className="w-1.5 h-1.5 bg-ember rounded-full shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  );

                  return n.href ? (
                    <Link key={n.id} href={n.href}>
                      {inner}
                    </Link>
                  ) : (
                    <div key={n.id}>{inner}</div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}