"use client";

import React from "react";
import { Map, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const PetaMap = dynamic(() => import("@/components/shared/PetaMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20 bg-slate-100 rounded-2xl">
      <Loader2 className="size-6 animate-spin text-brand-green-medium" />
    </div>
  ),
});

export default function PetaPreview() {
  return (
    <section id="peta" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Context */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-blue-light/10 text-brand-blue-medium animate-pulse">
              Geomapping Terpadu
            </div>

            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-brand-blue-dark leading-tight">
              Pemetaan Spasial Kawasan Hutan Bakau
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Sistem informasi kami memetakan zonasi penanaman mangrove secara
              spasial. Setiap lokasi penanaman didata dengan koordinat GPS
              presisi, memudahkan pelacakan sebaran jenis pohon, kepadatan
              kanopi, dan kerentanan wilayah pesisir terhadap ancaman erosi
              ombak.
            </p>

            <ul className="space-y-3.5">
              {[
                "Koordinat lokasi penanaman terekam presisi",
                "Pemantauan indeks kerapatan kanopi daun (NDVI)",
                "Visualisasi zonasi spesies Rhizophora & Avicennia",
                "Analisis historis perubahan garis pantai secara berkala",
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600"
                >
                  <CheckCircle className="w-4 h-4 text-brand-green-medium mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <a
                href="/auth/login?redirect=/admin/peta"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white bg-brand-blue-dark hover:bg-brand-blue-medium shadow-md transition-all-custom duration-300 transform hover:-translate-y-0.5"
              >
                <Map className="w-4 h-4" />
                Lihat Peta Lengkap
              </a>
            </div>
          </motion.div>

          {/* Right Column: Live Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 overflow-hidden"
          >
            <PetaMap compact />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
