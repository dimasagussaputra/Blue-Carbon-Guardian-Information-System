"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { KualitasAirComparisonPoint } from "@/lib/kualitas-air/types";

interface KualitasAirComparisonChartProps {
  data: KualitasAirComparisonPoint[];
}

export default function KualitasAirComparisonChart({
  data,
}: KualitasAirComparisonChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-slate-400 dark:text-slate-500">
        Belum ada data perbandingan
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />
          <XAxis
            dataKey="lokasi"
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              fontSize: "13px",
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>
            )}
          />
          <Bar
            dataKey="ph"
            name="pH"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="do"
            name="DO (mg/L)"
            fill="#3498db"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="salinitas"
            name="Salinitas (ppt)"
            fill="#a855f7"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="tss"
            name="TSS (mg/L)"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="suhu"
            name="Suhu (°C)"
            fill="#f97316"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
