"use client";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card } from "@/components/ui/card";

type ChartEntry = {
  month: string;
  packaging: number;
  equipment: number;
  total: number;
};

const COLORS = { packaging: "#B5481F", equipment: "#3A3F42", total: "#7A6A58" };

function formatUSD(v: number) {
  return `$${v.toFixed(0)}`;
}

export default function AccountAnalytics({
  chartData,
  packagingTotal,
  equipmentTotal,
  subAnnualValue,
  monthlyPackagingRate,
  orderCount,
}: {
  chartData: ChartEntry[];
  packagingTotal: number;
  equipmentTotal: number;
  subAnnualValue: number;
  monthlyPackagingRate: number;
  orderCount: number;
}) {
  const totalSpend = packagingTotal + equipmentTotal;
  const pieData = [
    { name: "Packaging", value: packagingTotal / 100, color: COLORS.packaging },
    { name: "Equipment", value: equipmentTotal / 100, color: COLORS.equipment },
  ].filter((d) => d.value > 0);

  const tooltipStyle = {
    fontSize: 12,
    border: "1px solid #e5e1db",
    borderRadius: 8,
    background: "#fff",
  };

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total spend (12m)", value: `$${(totalSpend / 100).toFixed(0)}` },
          { label: "Orders placed", value: orderCount },
          {
            label: "Avg monthly packaging",
            value: `$${(monthlyPackagingRate / 100).toFixed(0)}`,
          },
          {
            label: "Subscription annual value",
            value: `$${(subAnnualValue / 100).toFixed(0)}`,
          },
        ].map(({ label, value }) => (
          <Card key={label} className="p-4">
            <p className="font-display font-semibold text-2xl text-char">
              {value}
            </p>
            <p className="text-xs text-ash mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Monthly spend trend */}
      <Card className="p-5">
        <p className="text-sm font-medium text-char mb-4">
          Monthly spend — last 12 months
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradPackaging" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.packaging} stopOpacity={0.15} />
                <stop offset="95%" stopColor={COLORS.packaging} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradEquipment" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.equipment} stopOpacity={0.12} />
                <stop offset="95%" stopColor={COLORS.equipment} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e1db" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#7A6A58" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#7A6A58" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatUSD}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => [
                `$${Number(v ?? 0).toFixed(0)}`,
                "",
              ]}
            />
            <Area
              type="monotone"
              dataKey="packaging"
              name="Packaging"
              stroke={COLORS.packaging}
              strokeWidth={2}
              fill="url(#gradPackaging)"
            />
            <Area
              type="monotone"
              dataKey="equipment"
              name="Equipment"
              stroke={COLORS.equipment}
              strokeWidth={2}
              fill="url(#gradEquipment)"
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Category breakdown */}
        {pieData.length > 0 && (
          <Card className="p-5">
            <p className="text-sm font-medium text-char mb-4">
              Spend by category
            </p>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    strokeWidth={2}
                    stroke="#fff"
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [
                        `$${Number(v ?? 0).toFixed(0)}`,
                        "",
                      ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: d.color }}
                    />
                    <div>
                      <p className="text-sm text-char">{d.name}</p>
                      <p className="text-xs text-ash">
                        ${d.value.toFixed(0)}{" "}
                        (
                        {totalSpend > 0
                          ? Math.round((d.value / (totalSpend / 100)) * 100)
                          : 0}
                        %)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Packaging rate vs subscription */}
        <Card className="p-5">
          <p className="text-sm font-medium text-char mb-4">
            Packaging: manual vs subscription
          </p>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-ash mb-1">
                <span>Avg monthly spend (manual orders)</span>
                <span>${(monthlyPackagingRate / 100).toFixed(0)}/mo</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div
                  className="h-2 bg-ember rounded-full"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-ash mb-1">
                <span>Active subscription coverage</span>
                <span>
                  $
                  {(subAnnualValue / 100 / 12).toFixed(0)}/mo
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div
                  className="h-2 bg-graphite rounded-full"
                  style={{
                    width:
                      monthlyPackagingRate > 0
                        ? `${Math.min(100, Math.round(((subAnnualValue / 100 / 12) / (monthlyPackagingRate / 100)) * 100))}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
            {subAnnualValue === 0 && monthlyPackagingRate > 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-md">
                You're spending ~${(monthlyPackagingRate / 100).toFixed(0)}/mo
                on packaging manually. Set up auto-reorder to save time.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}