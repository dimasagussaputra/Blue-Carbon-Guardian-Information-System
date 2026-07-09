"use client";

import { Map } from "lucide-react";
import PetaMapShared from "@/components/shared/PetaMap";

export default function PetaMap() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-green-medium/10">
              <Map className="size-5 text-brand-green-medium" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Peta Mangrove</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Visualisasi sebaran tegakan, penyulaman, dan titik sampling kualitas air di kawasan Mangkang.
          </p>
        </div>
      </div>
      <PetaMapShared />
    </div>
  );
}
