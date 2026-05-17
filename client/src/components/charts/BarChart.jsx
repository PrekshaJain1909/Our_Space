import React from "react";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  const styles = getComputedStyle(document.documentElement);
  const labelColor = styles.getPropertyValue('--text-secondary') || '#94a3b8';

  return (
    <div className="card" style={{ padding: '0.5rem', minWidth: 140 }}>
      <div className="mb-1 text-[11px]" style={{ color: labelColor }}>{label}</div>
      {payload.map((item) => (
        <div key={item.dataKey} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="" style={{ color: 'var(--text-secondary)' }}>{item.name || item.dataKey}:</span>
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * BarChart
 *
 * Props:
 * - data: array of objects
 * - xKey: string (key for x-axis)
 * - bars: array of { dataKey, name?, color? }
 * - stacked: boolean (optional, for stacked bars)
 * - height: number (chart height, default 260)
 */
export default function BarChart({
  data = [],
  xKey = "label",
  bars = [{ dataKey: "value", name: "Value", color: "#ec4899" }],
  stacked = false,
  height = 260,
}) {
  const stackId = stacked ? "stack" : undefined;

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <ReBarChart
          data={data}
          margin={{ top: 8, right: 16, left: -16, bottom: 8 }}
        >
          <CartesianGrid
            stroke="rgba(148, 163, 184, 0.25)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey={xKey}
            tickMargin={8}
            tick={{ fill: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#cbd5f5', fontSize: 11 }}
            axisLine={{ stroke: getComputedStyle(document.documentElement).getPropertyValue('--card-border') || '#475569' }}
          />
          <YAxis
            tick={{ fill: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#cbd5f5', fontSize: 11 }}
            axisLine={{ stroke: getComputedStyle(document.documentElement).getPropertyValue('--card-border') || '#475569' }}
            tickMargin={4}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{
              paddingBottom: 8,
              fontSize: 11,
              color: "#e5e7eb",
            }}
          />

          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name || bar.dataKey}
              fill={bar.color || "#ec4899"}
              radius={[6, 6, 0, 0]}
              stackId={stackId}
            />
          ))}
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
