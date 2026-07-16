"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
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
    setOpen(!open);
    if (!open) fetchNotifications();
  }

  const typeIcon: Record<string, string> = {
    order_status: "📦",
    balance_due: "💳",
    service_ticket: "🔧",
    referral_credit: "🎁",
    review_request: "⭐",
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 text-ash hover:text-char transition-colors rounded-md"
        aria-label="Notifications"
      >
        <Bell size={17} strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-ember rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-200 top-full mt-2 w-80 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-sm font-medium text-char">Notifications</p>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-ember hover:underline flex items-center gap-1"
                >
                  <Check size={11} /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-8 text-center text-ash text-sm">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell
                    size={24}
                    className="text-ash mx-auto mb-2"
                    strokeWidth={1.5}
                  />
                  <p className="text-ash text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const inner = (
                    <div
                      className={`px-4 py-3 border-b border-border/50 last:border-0 hover:bg-steam/30 transition-colors cursor-pointer ${
                        !n.read ? "bg-ember/3" : ""
                      }`}
                      onClick={() => !n.read && markOneRead(n.id)}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-base flex-shrink-0 mt-0.5">
                          {typeIcon[n.type] ?? "🔔"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              !n.read
                                ? "font-medium text-char"
                                : "text-ash"
                            }`}
                          >
                            {n.title}
                          </p>
                          <p className="text-xs text-ash mt-0.5 leading-relaxed">
                            {n.body}
                          </p>
                          <p className="text-xs text-ash/60 mt-1">
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
                          <div className="w-1.5 h-1.5 bg-ember rounded-full flex-shrink-0 mt-1.5" />
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