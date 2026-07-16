"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

export default function RevenueChart({
  data,
}: {
  data: { date: string; revenue: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#B5481F" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#B5481F" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#7A6A58", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          dy={6}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#7A6A58", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            border: "1px solid #e5e1db",
            borderRadius: 10,
            background: "#ffffff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
          formatter={(value) => {
            const amount = typeof value === "number" ? value : Number(value ?? 0);
            return [`$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, "Revenue"];
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#B5481F"
          strokeWidth={2.5}
          fill="url(#revenueGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}