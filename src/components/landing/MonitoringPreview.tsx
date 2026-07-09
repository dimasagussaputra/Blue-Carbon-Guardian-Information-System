"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3, Droplet, Sun, Wind, ChevronRight, Activity, ArrowUpRight, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface RecentActivityItem {
  site: string;
  date: string;
  status: string;
  health: string;
}

interface GrowthTrendPoint {
  bulan: string;
  tinggi: number;
  diameter: number;
}

interface EnvTrendPoint {
  bulan: string;
  ph: number;
  do: number;
  salinitas: number;
  tss: number;
  suhu: number;
}

interface MonitoringData {
  recentActivity: RecentActivityItem[];
  growth: { avgTinggi: number; avgDiameter: number; survivalRate: number };
  growthTrend: GrowthTrendPoint[];
  environment: { avgPh: number; avgDo: number; avgSalinitas: number; avgTss: number; avgSuhu: number };
  envTrend: EnvTrendPoint[];
  carbon: { totalCo2e: number; totalKarbon: number; avgCo2e: number; recentCo2e: number };
}

export default function MonitoringPreview() {
  const [activeTab, setActiveTab] = useState<"growth" | "env" | "carbon">("growth");
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/monitoring-summary")
      .then((res) => res.json())
      .then((json) => setData(json as MonitoringData))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="monitoring" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-brand-green-light/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-brand-blue-light/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-green-light/10 text-brand-green-dark">
            Dashboard Pemantauan
          </span>
          <h2 className="text-3xl font-display font-extrabold text-brand-blue-dark">
            Sistem Monitoring Konservasi Mangrove
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Akses pemantauan visual data pertumbuhan tanaman secara real-time. Dashboard menyajikan
            metrik pertumbuhan, kondisi salinitas pesisir, hingga akkumulasi cadangan karbon.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <h3 className="font-bold text-slate-800 text-sm px-2 mb-2">Pilih Parameter</h3>

              <button
                onClick={() => setActiveTab("growth")}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold transition-all-custom ${activeTab === "growth"
                    ? "bg-brand-green-medium text-white shadow-md shadow-brand-green-medium/20"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Indeks Pertumbuhan
                </span>
                <ChevronRight className="w-4 h-4 opacity-75" />
              </button>

              <button
                onClick={() => setActiveTab("env")}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold transition-all-custom ${activeTab === "env"
                    ? "bg-brand-green-medium text-white shadow-md shadow-brand-green-medium/20"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
              >
                <span className="flex items-center gap-2">
                  <Droplet className="w-4 h-4" />
                  Kondisi Lingkungan (Salinitas)
                </span>
                <ChevronRight className="w-4 h-4 opacity-75" />
              </button>

              <button
                onClick={() => setActiveTab("carbon")}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl text-xs font-bold transition-all-custom ${activeTab === "carbon"
                    ? "bg-brand-green-medium text-white shadow-md shadow-brand-green-medium/20"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
              >
                <span className="flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  Akumulasi Karbon (tCO2e)
                </span>
                <ChevronRight className="w-4 h-4 opacity-75" />
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex-grow flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-3">Aktivitas Terakhir</h4>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-5 animate-spin text-slate-300" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(data?.recentActivity ?? []).length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">Belum ada data</p>
                    ) : (
                      (data?.recentActivity ?? []).slice(0, 4).map((report, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                          <div>
                            <span className="block font-bold text-slate-700">{report.site}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{report.date}</span>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-2 py-0.5 rounded-sm font-bold text-[9px] mb-1 ${report.status.includes("Butuh") ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                              {report.status}
                            </span>
                            <span className="block font-mono text-[10px] text-slate-500 font-semibold">
                              Status: {report.health}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="pt-4">
                <a
                  href="/auth/login?redirect=/admin/monitoring"
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-bold bg-brand-blue-dark hover:bg-brand-blue-medium text-white shadow-xs transition-colors duration-200"
                >
                  Lihat Monitoring Lengkap
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Dashboard Preview */}
          <div className="lg:col-span-8 bg-brand-blue-dark text-white rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl border border-white/5 relative overflow-hidden min-h-[350px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green-light/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4 z-10">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Dashboard Pemantauan Utama
                </span>
                <h3 className="text-lg font-bold text-white">
                  {activeTab === "growth" && "Analisis Laju Pertumbuhan Mangrove"}
                  {activeTab === "env" && "Kondisi Kimia & Fisika Air Pesisir"}
                  {activeTab === "carbon" && "Sekuestrasi & Estimasi Karbon Akumulatif"}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-brand-green-light animate-pulse" />
                  Live Sync
                </div>
              </div>
            </div>

            <div className="my-8 flex-grow flex items-center justify-center min-h-[180px] z-10">
              {loading ? (
                <Loader2 className="size-8 animate-spin text-white/40" />
              ) : !data ? (
                <p className="text-sm text-slate-400">Gagal memuat data</p>
              ) : activeTab === "growth" ? (
                <div className="w-full space-y-4">
                  {data.growthTrend.length > 0 ? (
                    <div className="h-36 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.growthTrend}>
                          <defs>
                            <linearGradient id="growthArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                          <XAxis dataKey="bulan" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={40} />
                          <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }} />
                          <Area type="monotone" dataKey="tinggi" stroke="#10b981" fill="url(#growthArea)" strokeWidth={2} name="Tinggi (cm)" />
                          <Area type="monotone" dataKey="diameter" stroke="#3498db" fill="none" strokeWidth={2} name="Diameter (cm)" />
                          <Legend wrapperStyle={{ fontSize: 10, color: "#94a3b8" }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center">Belum ada data pertumbuhan</p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                      <span className="block text-[10px] text-slate-400">Tinggi Rata-rata</span>
                      <span className="text-base font-extrabold text-white">{data.growth.avgTinggi.toFixed(1)} cm</span>
                    </div>
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                      <span className="block text-[10px] text-slate-400">Diameter Rata-rata</span>
                      <span className="text-base font-extrabold text-white">{data.growth.avgDiameter.toFixed(1)} cm</span>
                    </div>
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                      <span className="block text-[10px] text-slate-400">Total Monitoring</span>
                      <span className="text-base font-extrabold text-white">{data.growthTrend.reduce((s, g) => s + 1, 0)}x</span>
                    </div>
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                      <span className="block text-[10px] text-slate-400">Survival Rate</span>
                      <span className="text-base font-extrabold text-brand-green-light">{data.growth.survivalRate}%</span>
                    </div>
                  </div>
                </div>
              ) : activeTab === "env" ? (
                <div className="w-full space-y-4">
                  {data.envTrend.length > 0 ? (
                    <div className="h-36 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.envTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                          <XAxis dataKey="bulan" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={40} />
                          <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }} />
                          <Line type="monotone" dataKey="ph" stroke="#10b981" strokeWidth={2} dot={false} name="pH" />
                          <Line type="monotone" dataKey="do" stroke="#3498db" strokeWidth={2} dot={false} name="DO (mg/L)" />
                          <Line type="monotone" dataKey="salinitas" stroke="#f59e0b" strokeWidth={2} dot={false} name="Salinitas (ppt)" />
                          <Legend wrapperStyle={{ fontSize: 10, color: "#94a3b8" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center">Belum ada data lingkungan</p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                      <span className="block text-[10px] text-slate-400">Suhu Air</span>
                      <span className="text-base font-extrabold text-white">{data.environment.avgSuhu.toFixed(1)} °C</span>
                    </div>
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                      <span className="block text-[10px] text-slate-400">Tingkat pH Air</span>
                      <span className="text-base font-extrabold text-white">{data.environment.avgPh.toFixed(1)}</span>
                    </div>
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                      <span className="block text-[10px] text-slate-400">Dissolved Oxygen</span>
                      <span className="text-base font-extrabold text-white">{data.environment.avgDo.toFixed(1)} mg/L</span>
                    </div>
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                      <span className="block text-[10px] text-slate-400">Salinitas</span>
                      <span className="text-base font-extrabold text-white">{data.environment.avgSalinitas.toFixed(1)} ppt</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-4">
                  {data.carbon.totalCo2e > 0 ? (
                    <div className="h-36 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: "Total CO₂e", value: Math.round(data.carbon.totalCo2e) },
                          { name: "Total Karbon", value: Math.round(data.carbon.totalKarbon) },
                          { name: "Rata-rata", value: Math.round(data.carbon.avgCo2e) },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={50} />
                          <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }} />
                          <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} name="kg" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center">Belum ada data karbon</p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                      <span className="block text-[10px] text-slate-400">Total Sekuestrasi</span>
                      <span className="text-base font-extrabold text-white">{Math.round(data.carbon.totalCo2e).toLocaleString("id-ID")} kg CO₂e</span>
                    </div>
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                      <span className="block text-[10px] text-slate-400">Total Karbon</span>
                      <span className="text-base font-extrabold text-white">{Math.round(data.carbon.totalKarbon).toLocaleString("id-ID")} kg</span>
                    </div>
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                      <span className="block text-[10px] text-slate-400">Rata-rata per Hitung</span>
                      <span className="text-base font-extrabold text-white">{Math.round(data.carbon.avgCo2e).toLocaleString("id-ID")} kg CO₂e</span>
                    </div>
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                      <span className="block text-[10px] text-slate-400">Terakhir</span>
                      <span className="text-base font-extrabold text-brand-green-light">{Math.round(data.carbon.recentCo2e).toLocaleString("id-ID")} kg CO₂e</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-slate-400 text-xs flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-white/10 pt-4 z-10">
              <span>Diperbarui secara berkala oleh sensor IoT di Mangkang Kulon</span>
              <span className="font-semibold text-white">Satelit Sentinel-2 & AWS IoT Integrated</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
