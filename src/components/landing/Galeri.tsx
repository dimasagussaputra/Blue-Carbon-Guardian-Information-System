"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, ImageOff, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { KATEGORI_GALERI, LABEL_KATEGORI } from "@/lib/galeri/types";
import type { GaleriRecord, KategoriGaleri } from "@/lib/galeri/types";

const FILTERS: { tag: KategoriGaleri | "all"; label: string }[] = [
  { tag: "all", label: "Semua Foto" },
  ...KATEGORI_GALERI.map((k) => ({ tag: k, label: LABEL_KATEGORI[k] })),
];

const kategoriBadgeColor: Record<KategoriGaleri, string> = {
  before: "bg-amber-500",
  after: "bg-emerald-500",
  monitoring: "bg-blue-500",
  penyulaman: "bg-purple-500",
  edukasi: "bg-cyan-500",
  clean_up: "bg-rose-500",
};

export default function Galeri() {
  const [records, setRecords] = useState<GaleriRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<KategoriGaleri | "all">("all");
  const [startIndex, setStartIndex] = useState(0);

  const visibleCount = 4;

  const visibleRecords = useMemo(
    () => records.slice(startIndex, startIndex + visibleCount),
    [records, startIndex, visibleCount]
  );

  const hasPrev = startIndex > 0;
  const hasNext = startIndex + visibleCount < records.length;

  function goNext() {
    setStartIndex((i) => Math.min(i + visibleCount, records.length - 1));
  }

  function goPrev() {
    setStartIndex((i) => Math.max(i - visibleCount, 0));
  }

  useEffect(() => {
    setStartIndex(0);
  }, [filter]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filter !== "all") params.set("kategori", filter);
        const res = await fetch(`/api/galeri?${params.toString()}`);
        const result = await res.json();
        setRecords(result.data || []);
      } catch {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filter]);

  return (
    <section id="galeri" className="py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Caption */}
        <div className="max-w-3xl mx-auto text-center mb-12 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-green-light/10 text-brand-green-dark">
            Dokumentasi
          </span>
          <h2 className="text-3xl font-display font-extrabold text-brand-blue-dark">
            Galeri Kegiatan & Konservasi
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Kumpulan potret lapangan kegiatan KKN Tematik UNDIP 2026, keindahan lanskap alam,
            serta sarana edu-wisata yang dibangun di pesisir Mangkang.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-2 mb-12 flex-wrap">
          {FILTERS.map((btn) => (
            <button
              key={btn.tag}
              onClick={() => setFilter(btn.tag)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 shadow-xs ${
                filter === btn.tag
                  ? "bg-brand-green-dark text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Carousel */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-6 animate-spin text-brand-green-medium" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-slate-100">
              <ImageOff className="size-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-400">
              Belum ada dokumentasi
            </p>
          </div>
        ) : (
          <div className="relative max-w-6xl mx-auto">
            {/* Arrow Prev */}
            {hasPrev && (
              <button
                type="button"
                onClick={goPrev}
                className="absolute -left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-lg text-slate-700 hover:bg-white hover:text-brand-green-dark transition-all"
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="size-5" />
              </button>
            )}

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {visibleRecords.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-150 aspect-square shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    {/* Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url('${item.public_url}')` }}
                    />

                    {/* Dark overlay base */}
                    <div className="absolute inset-0 bg-brand-blue-deep/40 group-hover:bg-brand-green-deep/60 transition-colors duration-300" />

                    {/* Kategori badge */}
                    <div className="absolute left-3 top-3 z-10">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm ${
                          kategoriBadgeColor[item.kategori]
                        }`}
                      >
                        {LABEL_KATEGORI[item.kategori]}
                      </span>
                    </div>

                    {/* Bottom overlay — expands upward on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-brand-blue-deep/95 to-transparent pt-12 group-hover:from-brand-green-deep/95 group-hover:pt-[45%] transition-all duration-300">
                      <div className="flex flex-col justify-end text-white">
                        <h3 className="font-bold text-sm sm:text-base leading-tight">
                          {item.judul || LABEL_KATEGORI[item.kategori]}
                        </h3>
                        {item.tanggal && (
                          <p className="text-[11px] font-medium text-brand-green-light mt-0.5">
                            {new Date(item.tanggal).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300">
                          <div className="overflow-hidden">
                            <p className="text-[11px] text-slate-300 leading-relaxed pt-2 line-clamp-2">
                              {item.deskripsi || ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Arrow Next */}
            {hasNext && (
              <button
                type="button"
                onClick={goNext}
                className="absolute -right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-lg text-slate-700 hover:bg-white hover:text-brand-green-dark transition-all"
                aria-label="Selanjutnya"
              >
                <ChevronRight className="size-5" />
              </button>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
