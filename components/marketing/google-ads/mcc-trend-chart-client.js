"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatCurrency(value) {
  return `$${new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)}`;
}

export function MccTrendChartClient({ data }) {
  return (
    <div className="h-80 min-w-0">
      <ResponsiveContainer height="100%" minWidth={0} width="100%">
        <AreaChart
          data={data}
          margin={{ bottom: 0, left: -6, right: 8, top: 10 }}
        >
          <defs>
            <linearGradient id="mccSpend" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#18181b" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="mccConversions" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="#e4e4e7"
            strokeDasharray="4 4"
            vertical={false}
          />
          <XAxis
            axisLine={false}
            dataKey="label"
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickFormatter={formatCurrency}
            tickLine={false}
            yAxisId="spend"
          />
          <YAxis
            axisLine={false}
            orientation="right"
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickLine={false}
            yAxisId="conversions"
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #e4e4e7",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(24, 24, 27, 0.08)",
            }}
            formatter={(value, name) => [
              name === "spend" ? formatCurrency(value) : value,
              name === "spend" ? "Spend" : "Conversions",
            ]}
            labelStyle={{ color: "#18181b", fontWeight: 600 }}
          />
          <Area
            dataKey="spend"
            fill="url(#mccSpend)"
            stroke="#18181b"
            strokeWidth={3}
            type="monotone"
            yAxisId="spend"
          />
          <Area
            dataKey="conversions"
            fill="url(#mccConversions)"
            stroke="#10b981"
            strokeWidth={3}
            type="monotone"
            yAxisId="conversions"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
