"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

type ChartDataPoint = { label: string; revenue: number };

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const value: number = payload[0].value ?? 0;
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 shadow-2xl">
      <p className="text-sm font-semibold text-zinc-200 mb-1">{label}</p>
      <p className="text-lg font-bold text-yellow-400">
        ₹{value.toLocaleString("en-IN")}
      </p>
      <p className="text-[11px] text-zinc-500 mt-0.5">Revenue</p>
    </div>
  );
}

export function OverviewChart({ data }: { data: ChartDataPoint[] }) {
  const maxVal = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 4, left: -12, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#3f3f46"
          opacity={0.35}
        />
        <XAxis
          dataKey="label"
          stroke="#52525b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dy={10}
          tick={{ fill: "#71717a", fontWeight: 500 }}
        />
        <YAxis
          stroke="#52525b"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v === 0 ? "₹0" : `₹${(v / 1000).toFixed(0)}k`}
          tick={{ fill: "#71717a" }}
          width={46}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(234,179,8,0.07)", radius: 6 }} />
        <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={56}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.revenue === maxVal && maxVal > 0 ? "#f59e0b" : "#eab308"}
              opacity={entry.revenue === 0 ? 0.25 : entry.revenue === maxVal ? 1 : 0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
