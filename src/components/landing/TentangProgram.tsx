"use client";

import React from "react";
import { Shield, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function TentangProgram() {
    const pillars = [
        {
            icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
            title: "Abrasi Pesisir Mangkang",
            desc: "Menghadapi erosi pantai dan banjir rob akibat hilangnya proteksi alami hutan mangrove di pesisir Kota Semarang.",
        },
        {
            icon: <Shield className="w-6 h-6 text-brand-green-medium" />,
            title: "Restorasi Greenbelt",
            desc: "Upaya rehabilitasi intensif penanaman bibit mangrove jenis Rhizophora dan Avicennia untuk membangun benteng pertahanan alami.",
        },
        {
            icon: <TrendingUp className="w-6 h-6 text-brand-blue-medium" />,
            title: "Estimasi Blue Carbon",
            desc: "Mengukur kontribusi riil vegetasi pesisir dalam menyerap emisi karbon dioksida di atmosfer guna melawan pemanasan global.",
        },
        {
            icon: <Sparkles className="w-6 h-6 text-amber-500" />,
            title: "Ekowisata Berkelanjutan",
            desc: "Mendorong perekonomian lokal melalui pengembangan paket wisata edukasi mangrove yang dipadukan dengan konservasi terpadu.",
        },
    ];

    return (
        <section id="tentang" className="py-24 bg-white relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-accent rounded-full filter blur-3xl opacity-60 translate-x-20 -translate-y-10" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-100 rounded-full filter blur-3xl opacity-60 -translate-x-20 translate-y-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

                    {/* Left Column: Descriptive text */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:col-span-5 space-y-6"
                    >
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-green-light/10 text-brand-green-dark">
                            Tentang Program
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-brand-blue-dark leading-tight">
                            Melindungi Pesisir Mangkang Melalui Konservasi yang Terukur
                        </h2>

                        <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                            <p>
                                <strong>Program KKN Tematik Universitas Diponegoro 2026</strong> hadir di wilayah pesisir Kelurahan Mangkang Kulon untuk menghadirkan solusi teknologi mutakhir berupa <strong>Blue Carbon Guardian Information System</strong>.
                            </p>
                            <p>
                                Kawasan pesisir Mangkang saat ini terancam oleh laju abrasi pantai dan frekuensi rob yang kian meningkat. Proyek ini tidak hanya melakukan penanaman vegetasi mangrove baru secara konvensional, melainkan juga mengintegrasikan aspek pendataan berbasis teknologi guna memastikan kelangsungan hidup tanaman jangka panjang.
                            </p>
                            <p className="border-l-4 border-brand-green-medium pl-4 italic text-slate-500 text-xs sm:text-sm bg-slate-50 py-2 rounded-r-lg">
                                &ldquo;Kami mendigitalisasi pemantauan konservasi untuk memperpanjang usia tanaman mangrove dan menghitung kapasitas penyerapan karbon secara ilmiah.&rdquo;
                            </p>
                        </div>
                    </motion.div>

                    {/* Right Column: Cards Grid */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6"
                    >
                        {pillars.map((pillar, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -6 }}
                                transition={{ duration: 0.3 }}
                                className="p-6 bg-slate-50 hover:bg-white rounded-2xl border border-slate-100 hover:border-brand-green-light/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className="p-3 bg-white w-fit rounded-xl shadow-sm border border-slate-100/50">
                                        {pillar.icon}
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold text-brand-blue-dark">
                                        {pillar.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                        {pillar.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
