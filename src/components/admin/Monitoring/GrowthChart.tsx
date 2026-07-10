"use client";

import { useMemo } from "react";
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

interface GrowthPoint {
  tanggal: string;
  tinggi_cm: number;
  diameter_cm: number | null;
}

interface GrowthChartProps {
  data: GrowthPoint[];
  kode_tegakan?: string;
}

export default function GrowthChart({
  data,
  kode_tegakan,
}: GrowthChartProps) {
  const isEmpty = !data || data.length === 0;

  const chartData = useMemo(() => {
    if (isEmpty) return [];
    return data.map((d) => ({
      ...d,
      label: new Date(d.tanggal).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
    }));
  }, [data, isEmpty]);

  if (isEmpty) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
        <p className="text-sm text-slate-400 dark:text-slate-500">
          {kode_tegakan
            ? "Belum ada data pertumbuhan."
            : "Pilih tegakan untuk melihat grafik."}
        </p>
      </div>
    );
  }

  const hasDiameter = chartData.some((d) => d.diameter_cm != null);

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${Number(v).toFixed(0)} cm`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--card-foreground)",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              fontSize: "13px",
            }}
            formatter={(value, name) => [
              `${Number(value).toFixed(1)} cm`,
              name === "tinggi_cm" ? "Tinggi" : "Diameter",
            ]}
          />
          <Legend
            formatter={(value) =>
              value === "tinggi_cm" ? "Tinggi" : "Diameter"
            }
          />
          <Line
            type="monotone"
            dataKey="tinggi_cm"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{ fill: "#10b981", r: 4 }}
            activeDot={{ r: 6 }}
          />
          {hasDiameter && (
            <Line
              type="monotone"
              dataKey="diameter_cm"
              stroke="#0ea5e9"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "#0ea5e9", r: 3 }}
              activeDot={{ r: 5 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
