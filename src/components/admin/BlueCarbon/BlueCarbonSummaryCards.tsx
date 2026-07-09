"use client";

import { MapPin, Scale, FlaskConical, Cloud, DollarSign, Banknote } from "lucide-react";
import type { BlueCarbonResult } from "@/lib/blue-carbon/types";

interface BlueCarbonSummaryCardsProps {
  result: BlueCarbonResult;
}

export default function BlueCarbonSummaryCards({ result }: BlueCarbonSummaryCardsProps) {
  const cards = [
    {
      label: "Luas Area",
      value: result.area_ha.toLocaleString("id-ID"),
      unit: "hektar",
      icon: MapPin,
      color: "bg-brand-green-light/10 text-brand-green-medium",
    },
    {
      label: "Total Biomassa",
      value: result.biomassa_tons.toLocaleString("id-ID", {
        maximumFractionDigits: 2,
      }),
      unit: "ton",
      icon: Scale,
      color: "bg-brand-blue-light/10 text-brand-blue-light",
    },
    {
      label: "Simpanan Karbon",
      value: result.karbon_tons.toLocaleString("id-ID", {
        maximumFractionDigits: 2,
      }),
      unit: "ton C",
      icon: FlaskConical,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "CO₂ Ekuivalen",
      value: result.co2_ekuivalen_tons.toLocaleString("id-ID", {
        maximumFractionDigits: 2,
      }),
      unit: "ton CO₂e",
      icon: Cloud,
      color: "bg-sky-50 text-sky-600",
    },
    {
      label: "Nilai Ekonomi",
      value: `$${result.nilai_ekonomi.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      unit: `@ $${result.carbon_price}/ton`,
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Nilai Ekonomi (IDR)",
      value: `Rp${result.nilai_ekonomi_idr.toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      unit: `@ Rp${(result.carbon_price * 16500).toLocaleString("id-ID")}/ton`,
      icon: Banknote,
      color: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
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
          <p className="mt-3 truncate text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl xl:text-2xl" title={card.value}>{card.value}</p>
          <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500" title={card.unit}>{card.unit}</p>
        </div>
      ))}
    </div>
  );
}
