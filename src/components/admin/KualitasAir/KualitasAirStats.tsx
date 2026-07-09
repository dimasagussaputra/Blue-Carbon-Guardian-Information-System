"use client";

import { useEffect, useState } from "react";
import {
  Droplets,
  FlaskConical,
  Wind,
  Waves,
  Thermometer,
  Loader2,
} from "lucide-react";

interface KualitasAirStatsData {
  total: number;
  avg_ph: number;
  avg_do: number;
  avg_salinitas: number;
  avg_suhu: number;
}

interface KualitasAirStatsProps {
  area_id?: string;
  start_date?: string;
  end_date?: string;
}

export default function KualitasAirStats({
  area_id,
  start_date,
  end_date,
}: KualitasAirStatsProps) {
  const [stats, setStats] = useState<KualitasAirStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ trend: "true" });
        if (area_id) params.set("area_id", area_id);
        if (start_date) params.set("start_date", start_date);
        if (end_date) params.set("end_date", end_date);

        const res = await fetch(`/api/kualitas-air?${params.toString()}`);
        const trend: { ph: number; do: number; salinitas: number; tss: number; suhu: number }[] =
          await res.json();

        if (trend.length === 0) {
          setStats({
            total: 0,
            avg_ph: 0,
            avg_do: 0,
            avg_salinitas: 0,
            avg_suhu: 0,
          });
          return;
        }

        const n = trend.length;
        setStats({
          total: trend.length,
          avg_ph:
            Math.round(
              (trend.reduce((s, d) => s + d.ph, 0) / n) * 100
            ) / 100,
          avg_do:
            Math.round(
              (trend.reduce((s, d) => s + d.do, 0) / n) * 100
            ) / 100,
          avg_salinitas:
            Math.round(
              (trend.reduce((s, d) => s + d.salinitas, 0) / n) * 100
            ) / 100,
          avg_suhu:
            Math.round(
              (trend.reduce((s, d) => s + d.suhu, 0) / n) * 100
            ) / 100,
        });
      } catch {
        console.error("Gagal memuat statistik");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [area_id, start_date, end_date]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-brand-green-medium" />
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: "Total Sampling",
      value: stats.total,
      unit: "kali",
      icon: Droplets,
      color: "bg-brand-blue-light/10 text-brand-blue-light",
    },
    {
      label: "Rata-rata pH",
      value: stats.avg_ph.toFixed(2),
      unit: "pH",
      icon: FlaskConical,
      color: "bg-brand-green-light/10 text-brand-green-medium",
    },
    {
      label: "Rata-rata DO",
      value: stats.avg_do.toFixed(2),
      unit: "mg/L",
      icon: Wind,
      color: "bg-sky-50 text-sky-600",
    },
    {
      label: "Rata-rata Salinitas",
      value: stats.avg_salinitas.toFixed(2),
      unit: "ppt",
      icon: Waves,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Rata-rata Suhu",
      value: stats.avg_suhu.toFixed(1),
      unit: "°C",
      icon: Thermometer,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-5 overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {card.label}
            </p>
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${card.color}`}
            >
              <card.icon className="size-4" />
            </div>
          </div>
          <p className="mt-3 truncate text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl xl:text-2xl" title={String(card.value)}>{card.value}</p>
          <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500" title={card.unit}>{card.unit}</p>
        </div>
      ))}
    </div>
  );
}
