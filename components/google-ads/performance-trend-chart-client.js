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

function formatCurrency(value) {
  return `$${new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)}`;
}

const metricConfig = {
  spend: {
    gradientId: "spendGradient",
    stroke: "#18181b",
    stopColor: "#18181b",
    formatter: formatCurrency,
    label: "Spend",
  },
  conversions: {
    gradientId: "conversionGradient",
    stroke: "#10b981",
    stopColor: "#10b981",
    formatter: (value) => value,
    label: "Conversions",
  },
};

export function PerformanceTrendChartClient({ data, metric = "spend" }) {
  const config = metricConfig[metric];

  return (
    <ResponsiveChart height={320}>
      <AreaChart
          data={data}
          margin={{ bottom: 0, left: -6, right: 8, top: 10 }}
        >
          <defs>
            <linearGradient
              id={config.gradientId}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop offset="5%" stopColor={config.stopColor} stopOpacity={0.22} />
              <stop offset="95%" stopColor={config.stopColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="#e4e4e7"
            strokeDasharray="4 4"
            vertical={false}
          />
          <XAxis
            axisLine={false}
            dataKey="day"
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickFormatter={config.formatter}
            tickLine={false}
            yAxisId={metric}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #e4e4e7",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(24, 24, 27, 0.08)",
            }}
            formatter={(value, name) => [
              config.formatter(value),
              name === metric ? config.label : name,
            ]}
            labelStyle={{ color: "#18181b", fontWeight: 600 }}
          />
          <Area
            activeDot={{
              fill: config.stroke,
              r: 5,
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            dataKey={metric}
            fill={`url(#${config.gradientId})`}
            stroke={config.stroke}
            strokeWidth={3}
            type="monotone"
            yAxisId={metric}
          />
        </AreaChart>
    </ResponsiveChart>
  );
}
