"use client";

import React, { useState, useEffect } from "react";
import { Wind, Shield, Users, ArrowUpRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ComparisonItem {
  name: string;
  value: number;
  unit: string;
  color: string;
}

interface BlueCarbonData {
  totalKarbon: number;
  totalCo2e: number;
  totalAreaHa: number;
  totalTegakan: number;
  tegankanHidup: number;
  survivalRate: number;
  comparison: ComparisonItem[];
}

export default function BlueCarbonDetails() {
  const [data, setData] = useState<BlueCarbonData | null>(null);

  useEffect(() => {
    fetch("/api/public/blue-carbon-summary")
      .then((res) => res.json())
      .then((json) => setData(json as BlueCarbonData))
      .catch(() => setData(null));
  }, []);

  const benefits = [
    {
      icon: <Wind className="w-5 h-5 text-brand-green-light" />,
      title: "Penyerap Karbon Super",
      desc: "Menyerap CO₂ atmosferik hingga 10 kali lipat lebih cepat per hektar dibandingkan dengan ekosistem hutan tropis darat.",
    },
    {
      icon: <Shield className="w-5 h-5 text-brand-green-light" />,
      title: "Penjaga Batas Pantai",
      desc: "Meredam energi ombak besar hingga 66%, melindungi tambak warga, pemukiman, dan infrastruktur dari tsunami dan badai.",
    },
    {
      icon: <Users className="w-5 h-5 text-brand-green-light" />,
      title: "Penopang Penghidupan",
      desc: "Menyediakan habitat asri bagi pembiakan kepiting, udang, dan ikan komersial yang menjadi tumpuan nafkah nelayan lokal.",
    },
  ];

  const comparison = data?.comparison ?? [
    { name: "Hutan Mangrove Pesisir", value: 1000, unit: "ton C/ha", color: "#10b981" },
    { name: "Hutan Hujan Tropis Daratan", value: 120, unit: "ton C/ha", color: "#6b7280" },
  ];

  const maxValue = Math.max(...comparison.map((c) => c.value));

  return (
    <section id="blue-carbon" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="lines" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 0,10 L 40,10 M 10,0 L 10,40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#lines)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 bg-brand-blue-dark text-white rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-brand-green-medium/20 rounded-full blur-2xl pointer-events-none" />

            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              Perbandingan Penyerapan Emisi
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-extrabold mt-2 mb-6">
              Mengapa Disebut Karbon Biru?
            </h3>

            {data ? (
              <div className="space-y-6">
                {comparison.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{item.name}</span>
                      <span className={idx === 0 ? "text-brand-green-light font-bold" : "text-slate-400 font-bold"}>
                        {item.value.toLocaleString("id-ID")} {item.unit}
                      </span>
                    </div>
                    <div className="h-3.5 bg-white/10 rounded-full overflow-hidden p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(item.value / maxValue) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(to right, ${item.color}, ${item.color}dd)` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Total Karbon</span>
                    <span className="text-sm font-bold text-white">
                      {data.totalKarbon > 0 ? `${(data.totalKarbon / 1000).toFixed(1)} t` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Total CO₂e</span>
                    <span className="text-sm font-bold text-white">
                      {data.totalCo2e > 0 ? `${(data.totalCo2e / 1000).toFixed(1)} t` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Tegakan Hidup</span>
                    <span className="text-sm font-bold text-white">
                      {data.tegankanHidup > 0 ? `${data.tegankanHidup} (${data.survivalRate}%)` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="size-6 animate-spin text-white/40" />
              </div>
            )}

            <p className="text-xs text-slate-400 mt-8 leading-relaxed">
              * Rata-rata kapasitas akumulasi karbon bakau mencakup penyimpanan sedimen lumpur bawah tanah yang padat oksigen rendah, mengunci karbon selama ribuan tahun tanpa membusuk menjadi CO₂.
            </p>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-green-light/10 text-brand-green-dark">
              Mitigasi Perubahan Iklim
            </div>

            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-brand-blue-dark leading-tight">
              Investasi Karbon Biru demi Kelangsungan Habitat Pesisir
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Karbon Biru merupakan karbon yang diserap, disimpan, dan dilepaskan oleh ekosistem laut
              dan pesisir. Di Mangkang, penanaman hutan bakau adalah langkah strategis mengurangi jejak
              karbon global sekaligus memperkuat daya tahan ekologi pesisir Semarang Barat.
            </p>

            <div className="space-y-6 pt-4">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="p-2.5 bg-brand-green-dark rounded-xl text-white shrink-0 shadow-sm">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-blue-dark text-sm sm:text-base mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <a
                href="/auth/login?redirect=/admin/blue-carbon"
                className="group inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-brand-green-dark hover:text-brand-green-medium transition-colors"
              >
                Pelajari Selengkapnya Mengenai Konservasi
                <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
