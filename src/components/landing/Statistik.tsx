"use client";

import React, { useEffect, useState, useRef } from "react";
import { Trees, ShieldCheck, RefreshCw, MapPin, Wind, Maximize2 } from "lucide-react";
import { motion, useInView } from "framer-motion";

interface StatsData {
  totalTegakan: number;
  survivalRate: number;
  totalPenyulaman: number;
  totalSamplingAir: number;
  totalBlueCarbon: number;
  totalArea: number;
}

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
  color: string;
}

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const duration = 2000;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = progress * (2 - progress);
      const currentCount = Math.floor(easeProgress * (end - start) + start);
      setCount(currentCount);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value]);

  return (
    <span ref={ref} className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
      {count.toLocaleString("id-ID")}
      <span className="text-brand-green-medium ml-0.5">{suffix}</span>
    </span>
  );
}

export default function Statistik() {
  const [data, setData] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch("/api/public/stats")
      .then((res) => res.json())
      .then((json) => setData(json as StatsData))
      .catch(() => setData(null));
  }, []);

  const stats: StatItem[] = data
    ? [
        { icon: <Trees className="w-5 h-5 text-brand-green-medium" />, label: "Total Tegakan Mangrove", value: data.totalTegakan, suffix: " Pohon", color: "border-brand-green-medium/20 hover:border-brand-green-medium/40" },
        { icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />, label: "Survival Rate (Tingkat Hidup)", value: data.survivalRate, suffix: "%", color: "border-emerald-500/20 hover:border-emerald-500/40" },
        { icon: <RefreshCw className="w-5 h-5 text-amber-500" />, label: "Jumlah Penyulaman", value: data.totalPenyulaman, suffix: " Kegiatan", color: "border-amber-500/20 hover:border-amber-500/40" },
        { icon: <MapPin className="w-5 h-5 text-brand-blue-medium" />, label: "Jumlah Titik Sampling Air", value: data.totalSamplingAir, suffix: " Titik", color: "border-brand-blue-medium/20 hover:border-brand-blue-medium/40" },
        { icon: <Wind className="w-5 h-5 text-cyan-600" />, label: "Estimasi Serapan Blue Carbon", value: Math.round(data.totalBlueCarbon), suffix: " tCO₂e", color: "border-cyan-500/20 hover:border-cyan-500/40" },
        { icon: <Maximize2 className="w-5 h-5 text-indigo-500" />, label: "Luas Area Monitoring", value: data.totalArea, suffix: " Zona", color: "border-indigo-500/20 hover:border-indigo-500/40" },
      ]
    : [];

  return (
    <section id="statistik" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-brand-green-light/10 text-brand-green-dark">
            Metrik Konservasi
          </span>
          <h2 className="text-3xl font-display font-extrabold text-brand-blue-dark">
            Statistik Real-time Kawasan Mangrove Mangkang
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Data pemantauan lapangan yang terus diperbarui untuk melacak perkembangan
            biomassa, kesuburan, dan kesehatan area restorasi greenbelt pesisir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.length === 0
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 w-28 rounded bg-slate-200" />
                    <div className="h-10 w-10 rounded-xl bg-slate-200" />
                  </div>
                  <div className="h-8 w-24 rounded bg-slate-200" />
                </div>
              ))
            : stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                  className={`p-6 bg-white rounded-2xl border ${stat.color} shadow-sm group hover:shadow-md transition-all duration-300 flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-sm font-semibold text-slate-500 leading-snug">
                      {stat.label}
                    </span>
                    <div className="p-2.5 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="pt-2">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </div>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
