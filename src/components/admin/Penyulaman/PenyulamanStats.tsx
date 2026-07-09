"use client";

import { useEffect, useState } from "react";
import {
  Sprout,
  Leaf,
  Heart,
  Activity,
  Loader2,
} from "lucide-react";
import type { PenyulamanStats as Stats } from "@/lib/penyulaman/types";

interface PenyulamanStatsProps {
  gelombang?: string;
}

export default function PenyulamanStats({ gelombang }: PenyulamanStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ stats: "true" });
        if (gelombang) params.set("gelombang", gelombang);

        const res = await fetch(`/api/penyulaman?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        console.error("Gagal memuat statistik");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [gelombang]);

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
      label: "Total Kegiatan",
      value: stats.total_kegiatan,
      unit: "kali",
      icon: Activity,
      color: "bg-brand-blue-light/10 text-brand-blue-light",
    },
    {
      label: "Total Bibit",
      value: stats.total_bibit.toLocaleString("id-ID"),
      unit: "bibit",
      icon: Sprout,
      color: "bg-brand-green-light/10 text-brand-green-medium",
    },
    {
      label: "Bibit Hidup",
      value: stats.total_hidup.toLocaleString("id-ID"),
      unit: "bibit",
      icon: Heart,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Survival Rate",
      value:
        stats.survival_rate !== null ? `${stats.survival_rate}%` : "-",
      unit: "rata-rata",
      icon: Leaf,
      color: "bg-brand-green-medium/10 text-brand-green-dark",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
