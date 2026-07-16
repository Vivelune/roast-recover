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
    order_placed:   { icon: "🛒", color: "bg-blue-50 text-blue-600" },
    deposit_paid:   { icon: "💳", color: "bg-green-50 text-green-600" },
    balance_paid:   { icon: "✅", color: "bg-green-50 text-green-700" },
    order_shipped:  { icon: "🚚", color: "bg-indigo-50 text-indigo-600" },
    order_delivered:{ icon: "📦", color: "bg-green-50 text-green-700" },
    sub_renewed:    { icon: "🔄", color: "bg-purple-50 text-purple-600" },
    review_left:    { icon: "⭐", color: "bg-yellow-50 text-yellow-600" },
    credit_earned:  { icon: "🎁", color: "bg-ember/10 text-ember" },
  };
  
  export default function ActivityFeed({
    entries,
  }: {
    entries: ActivityEntry[];
  }) {
    if (entries.length === 0) {
      return (
        <p className="text-ash text-sm py-4">
          Your activity will appear here as you place orders.
        </p>
      );
    }
  
    return (
      <div className="space-y-1">
        {entries.map((entry, i) => {
          const config = typeConfig[entry.type] ?? {
            icon: "📋",
            color: "bg-gray-50 text-gray-600",
          };
  
          return (
            <div key={entry.id} className="flex items-start gap-3 py-2.5">
              {/* Icon dot with connecting line */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${config.color}`}
                >
                  {config.icon}
                </div>
                {i < entries.length - 1 && (
                  <div className="w-px flex-1 bg-border mt-1 min-h-[16px]" />
                )}
              </div>
              <div className="flex-1 min-w-0 pb-2">
                <p className="text-sm text-char">{entry.title}</p>
                <p className="text-xs text-ash mt-0.5">
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
    );
  }