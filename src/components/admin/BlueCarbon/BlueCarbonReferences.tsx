"use client";

import { BookOpen } from "lucide-react";
import { REFERENCES } from "@/lib/blue-carbon/constants";

interface BlueCarbonReferencesProps {
  referensi: string[];
}

export default function BlueCarbonReferences({
  referensi,
}: BlueCarbonReferencesProps) {
  const matched = REFERENCES.filter((r) =>
    referensi.some((s) =>
      r.citation.toLowerCase().includes(s.split("(")[0].trim().toLowerCase())
    )
  );

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50">
          <BookOpen className="size-4 text-amber-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Referensi Literatur
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Sumber data dan formula yang digunakan
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {(matched.length > 0 ? matched : REFERENCES).map((ref, i) => (
          <div
            key={ref.id}
            className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-3"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                {i + 1}
              </span>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Referensi {ref.id}
              </p>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {ref.citation}
            </p>
            {ref.url && (
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex text-[11px] text-brand-blue-light hover:underline"
              >
                Lihat sumber →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
