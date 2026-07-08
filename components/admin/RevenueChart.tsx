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
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#B5481F" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#B5481F" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e1db" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#7A6A58" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#7A6A58" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
  contentStyle={{
    fontSize: 12,
    border: "1px solid #e5e1db",
    borderRadius: 8,
    background: "#fff",
  }}
  formatter={(value) => {
    const amount =
      typeof value === "number"
        ? value
        : Number(value ?? 0);

    return [`$${amount.toFixed(2)}`, "Revenue"];
  }}
/>
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#B5481F"
          strokeWidth={2}
          fill="url(#revenueGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}