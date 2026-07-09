"use client";

import React from "react";
import { TreePine, Hourglass, CreditCard, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function PaketWisata() {
    const packages = [
        {
            image: "/wisata_ekowisata.png",
            title: "Paket Ekowisata Mangrove Mangkang",
            desc: "Menelusuri bentangan hutan mangrove yang asri lewat boardwalk kayu khas pesisir, menanam bibit secara langsung, dan mencicipi hidangan kuliner tradisional dari warga lokal.",
            price: "Rp 75.000",
            per: "orang",
            features: [
                "Tour guide lokal berpengalaman",
                "Penanaman 2 bibit mangrove",
                "Alat penanaman (sepatu boot & sekop)",
                "Welcome drink & Snack tradisional",
            ],
            icon: <TreePine className="w-5 h-5 text-brand-green-medium" />,
            badge: "Terpopuler",
        },
        {
            image: "/wisata_edukasi.png",
            title: "Workshop Edukasi Blue Carbon & Konservasi",
            desc: "Kelas intensif pembibitan mangrove, simulasi pemetaan sebaran vegetasi, perhitungan emisi penyerapan karbon secara digital, serta mendapatkan sertifikat kepedulian lingkungan.",
            price: "Rp 150.000",
            per: "orang",
            features: [
                "Materi pengantar Blue Carbon",
                "Praktek pembibitan di nursery zone",
                "Sertifikat fisik & digital",
                "Akses log data monitoring tanaman Anda",
            ],
            icon: <Hourglass className="w-5 h-5 text-brand-blue-medium" />,
            badge: "Edukasi Spesifik",
        },
    ];

    return (
        <section id="wisata" className="py-24 bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Caption */}
                <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-green-light/10 text-brand-green-dark">
                        Wisata Edukasi
                    </span>
                    <h2 className="text-3xl font-display font-extrabold text-brand-blue-dark">
                        Paket Wisata & Konservasi Mangrove Mangkang
                    </h2>
                    <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                        Ikut serta melindungi bumi melalui pariwisata berkelanjutan. Setiap paket kunjungan
                        yang Anda pilih berkontribusi langsung pada pendanaan bibit dan pemeliharaan mangrove.
                    </p>
                </div>

                {/* Action Grid cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {packages.map((pkg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.6 }}
                            className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 Transition-all-custom duration-300 flex flex-col justify-between group"
                        >
                            <div>
                                {/* Visual Thumbnail */}
                                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500 opacity-90"
                                        style={{ backgroundImage: `url('${pkg.image}')` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                                    {/* Badge */}
                                    <span className="absolute top-4 right-4 px-3 py-1 bg-brand-blue-dark/85 backdrop-blur-xs text-[10px] sm:text-xs font-bold text-brand-green-light rounded-full border border-white/10">
                                        {pkg.badge}
                                    </span>
                                </div>

                                {/* Card description */}
                                <div className="p-6 md:p-8 space-y-5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 bg-slate-50 rounded-lg">
                                            {pkg.icon}
                                        </div>
                                        <h3 className="text-base sm:text-lg font-bold text-brand-blue-dark group-hover:text-brand-green-medium transition-colors leading-tight">
                                            {pkg.title}
                                        </h3>
                                    </div>

                                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                                        {pkg.desc}
                                    </p>

                                    <div className="space-y-2.5">
                                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            Fasilitas yang Didapat:
                                        </span>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                                            {pkg.features.map((item, fIdx) => (
                                                <li key={fIdx} className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-green-medium shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Price level and checkout button */}
                            <div className="px-6 pb-6 md:px-8 md:pb-8 pt-4 border-t border-slate-50/80 flex items-center justify-between gap-4">
                                <div>
                                    <span className="block text-[10px] text-slate-405 font-semibold uppercase leading-none">
                                        Investasi Tiket
                                    </span>
                                    <span className="text-lg sm:text-xl font-extrabold text-brand-blue-dark">
                                        {pkg.price}
                                        <span className="text-xs font-semibold text-slate-400">/{pkg.per}</span>
                                    </span>
                                </div>

                                <button className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-brand-green-medium text-white hover:bg-brand-green-dark shadow-md shadow-brand-green-medium/10 transition-colors group/btn">
                                    Detail Paket
                                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                </button>
                            </div>

                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
