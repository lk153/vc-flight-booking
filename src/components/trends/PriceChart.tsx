"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { PriceSnapshot } from "@/types";
import { AIRLINES } from "@/lib/airports";
import { formatPriceShort } from "@/lib/utils";

interface PriceChartProps {
  snapshots: PriceSnapshot[];
}

export function PriceChart({ snapshots }: PriceChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const colors = {
    grid: isDark ? "#1e4a60" : "#e2e8f0",
    tick: isDark ? "#8eaab8" : "#64748b",
    tooltipBg: isDark ? "#132f42" : "#ffffff",
    tooltipBorder: isDark ? "#1e4a60" : "#e2e8f0",
    tooltipText: isDark ? "#f0ece4" : "#1a1a2e",
    legend: isDark ? "#8eaab8" : "#64748b",
  };

  // Transform: group by date, airline as columns
  const chartData = useMemo(() => {
    const byDate = new Map<string, Record<string, number>>();

    for (const s of snapshots) {
      if (!byDate.has(s.date)) {
        byDate.set(s.date, {});
      }
      const entry = byDate.get(s.date)!;
      // Keep the min price per airline per day
      if (!entry[s.airlineCode] || s.priceVND < entry[s.airlineCode]) {
        entry[s.airlineCode] = s.priceVND;
      }
    }

    return Array.from(byDate.entries())
      .map(([date, prices]) => ({ date, ...prices }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [snapshots]);

  const airlinesInData = useMemo(() => {
    const codes = new Set(snapshots.map((s) => s.airlineCode));
    return AIRLINES.filter((a) => codes.has(a.iataCode));
  }, [snapshots]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No price data available
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: colors.tick }}
            tickFormatter={(d: string) => {
              const date = new Date(d);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: colors.tick }}
            tickFormatter={(v: number) => formatPriceShort(v)}
            width={50}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: `1px solid ${colors.tooltipBorder}`,
              backgroundColor: colors.tooltipBg,
              color: colors.tooltipText,
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              fontSize: 12,
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => {
              const airline = AIRLINES.find((a) => a.iataCode === name);
              return [
                value != null
                  ? new Intl.NumberFormat("vi-VN").format(Number(value)) + "đ"
                  : "—",
                airline?.name || String(name),
              ];
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            labelFormatter={(label: any) => {
              const date = new Date(String(label));
              return date.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
            }}
          />
          <Legend
            formatter={(value: string) => {
              const airline = AIRLINES.find((a) => a.iataCode === value);
              return airline?.name || value;
            }}
            wrapperStyle={{ fontSize: 12, color: colors.legend }}
          />
          {airlinesInData.map((airline) => (
            <Line
              key={airline.iataCode}
              type="monotone"
              dataKey={airline.iataCode}
              stroke={airline.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
