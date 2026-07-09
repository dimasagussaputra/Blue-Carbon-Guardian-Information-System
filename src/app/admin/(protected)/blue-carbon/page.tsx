"use client";

import { useState } from "react";
import { Leaf } from "lucide-react";
import BlueCarbonCalculator from "@/components/admin/BlueCarbon/BlueCarbonCalculator";
import BlueCarbonHistory from "@/components/admin/BlueCarbon/BlueCarbonHistory";

export default function BlueCarbonPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-brand-green-medium/10">
            <Leaf className="size-5 text-brand-green-medium" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Blue Carbon
            </h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Estimasi dan analisis simpanan karbon biru ekosistem mangrove Mangkang.
            </p>
          </div>
        </div>
      </div>

      <BlueCarbonCalculator onSaved={() => setRefreshKey((k) => k + 1)} />
      <BlueCarbonHistory refreshKey={refreshKey} />
    </div>
  );
}
