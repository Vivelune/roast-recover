type ActivityEntry = {
  id: string;
  type: string;
  title: string;
  metadata: any;
  createdAt: Date;
};

const typeConfig: Record<
  string,
  { icon: string; color: string }
> = {
  order_placed:   { icon: "🛒", color: "bg-blue-50 border-blue-100 text-blue-600" },
  deposit_paid:   { icon: "💳", color: "bg-emerald-50 border-emerald-100 text-emerald-600" },
  balance_paid:   { icon: "✅", color: "bg-green-50 border-green-100 text-green-700" },
  order_shipped:  { icon: "🚚", color: "bg-indigo-50 border-indigo-100 text-indigo-600" },
  order_delivered:{ icon: "📦", color: "bg-green-50 border-green-100 text-green-700" },
  sub_renewed:    { icon: "🔄", color: "bg-purple-50 border-purple-100 text-purple-600" },
  review_left:    { icon: "⭐", color: "bg-amber-50 border-amber-100 text-amber-600" },
  credit_earned:  { icon: "🎁", color: "bg-ember/10 border-ember/20 text-ember" },
};

export default function ActivityFeed({
  entries,
}: {
  entries: ActivityEntry[];
}) {
  if (entries.length === 0) {
    return (
      <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center bg-steam/10">
        <p className="text-sm text-ash">
          Activity events will log here as you order items.
        </p>
      </div>
    );
  }

  return (
    <div className="relative pl-1">
      {/* Decorative vertical timeline guide line */}
      <div className="absolute left-[15px] top-2.5 bottom-2.5 w-[1px] bg-gray-100 -z-10" />

      <div className="space-y-1">
        {entries.map((entry, i) => {
          const config = typeConfig[entry.type] ?? {
            icon: "📋",
            color: "bg-gray-50 border-gray-100 text-gray-600",
          };

          return (
            <div key={entry.id} className="flex items-start gap-4 py-3 relative">
              {/* Badge Icon wrapper */}
              <div className="flex-shrink-0 z-10">
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm shadow-sm bg-white ${config.color}`}
                >
                  {config.icon}
                </div>
              </div>

              {/* Feed Content description */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-medium text-char tracking-tight leading-snug">
                  {entry.title}
                </p>
                <p className="text-xs text-ash mt-0.5 font-medium">
                  {new Date(entry.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}