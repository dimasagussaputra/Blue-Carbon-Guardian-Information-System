"use client";

import { ClipboardList } from "lucide-react";
import type { CalculationBreakdown } from "@/lib/blue-carbon/types";

interface BlueCarbonBreakdownProps {
  breakdown: CalculationBreakdown[];
  metode: string;
}

export default function BlueCarbonBreakdown({
  breakdown,
  metode,
}: BlueCarbonBreakdownProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-violet-50">
          <ClipboardList className="size-4 text-violet-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Detail Perhitungan
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 capitalize">
            Metode: {metode === "allometric" ? "Allometric (Komiyama et al.)" : "IPCC Tier 1"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {breakdown.map((step) => (
          <div
            key={step.step}
            className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-4"
          >
            <div className="mb-1.5 flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-brand-green-medium/10 text-[11px] font-bold text-brand-green-medium">
                {step.step}
              </span>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{step.label}</p>
            </div>
            <p className="mb-1 font-mono text-xs text-slate-500 dark:text-slate-400">{step.formula}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {step.nilai}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">{step.satuam}</span>
            </div>
            {step.sumber && step.sumber !== "-" && (
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Sumber: {step.sumber}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
