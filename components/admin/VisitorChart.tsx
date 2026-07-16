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
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e1db" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#7A6A58" }}
          axisLine={false}
          tickLine={false}
          interval={4}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#7A6A58" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            border: "1px solid #e5e1db",
            borderRadius: 8,
            background: "#fff",
          }}
          formatter={(v) => [
            typeof v === "number" ? v.toLocaleString() : "0",
            "Page views",
          ]}
        />
        <Bar
          dataKey="views"
          fill="#B5481F"
          radius={[3, 3, 0, 0]}
          maxBarSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}