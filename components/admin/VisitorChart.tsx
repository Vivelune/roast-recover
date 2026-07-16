"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

export default function VisitorChart({
  data,
}: {
  data: { date: string; views: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        {/* Soft grid colors using muted brand borders */}
        <CartesianGrid strokeDasharray="3 3" stroke="#f1eeea" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#7A6A58", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          interval={4}
          dy={8}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#7A6A58", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          dx={-8}
        />
        <Tooltip
          cursor={{ fill: "rgba(46, 46, 45, 0.04)" }}
          contentStyle={{
            fontSize: 11,
            fontWeight: 600,
            color: "#2E2E2D",
            border: "1px solid #f1eeea",
            borderRadius: 12,
            background: "#ffffff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          }}
          formatter={(v) => [
            typeof v === "number" ? v.toLocaleString() : "0",
            "Page Views",
          ]}
        />
        <Bar
          dataKey="views"
          fill="#2E2E2D" // Brand Charcoal Color
          radius={[4, 4, 0, 0]}
          maxBarSize={18}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}