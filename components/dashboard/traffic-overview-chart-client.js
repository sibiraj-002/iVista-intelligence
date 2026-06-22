"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ResponsiveChart } from "@/components/charts/responsive-chart";

function formatNumber(value) {
  if (value >= 1000) {
    return `${Math.round(value / 1000)}K`;
  }

  return value;
}

export function TrafficOverviewChartClient({ data }) {
  return (
    <ResponsiveChart height={288}>
      <AreaChart
          data={data}
          margin={{ bottom: 0, left: -12, right: 8, top: 10 }}
        >
          <defs>
            <linearGradient id="trafficGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#18181b" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="leadsGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
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
            dataKey="month"
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickFormatter={formatNumber}
            tickLine={false}
            yAxisId="clicks"
          />
          <YAxis
            axisLine={false}
            orientation="right"
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickFormatter={formatNumber}
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
              name === "traffic" ? value.toLocaleString() : value,
              name === "traffic" ? "Clicks" : "Conversions",
            ]}
            labelStyle={{ color: "#18181b", fontWeight: 600 }}
          />
          <Area
            activeDot={{
              fill: "#18181b",
              r: 5,
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            dataKey="traffic"
            fill="url(#trafficGradient)"
            stroke="#18181b"
            strokeWidth={3}
            type="monotone"
            yAxisId="clicks"
          />
          <Area
            activeDot={{
              fill: "#10b981",
              r: 5,
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            dataKey="leads"
            fill="url(#leadsGradient)"
            stroke="#10b981"
            strokeWidth={3}
            type="monotone"
            yAxisId="conversions"
          />
        </AreaChart>
    </ResponsiveChart>
  );
}
