"use client";

import React from "react";
import { Search, Trash2, BookOpen, UserPlus, Eye, AreaChart, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function Timeline() {
    const steps = [
        {
            icon: <Search className="w-5 h-5" />,
            title: "Observasi & Survei Mulai",
            date: "Januari 2026",
            desc: "Studi kelayakan ekologi pesisir Mangkang, analisis laju abrasi, wawancara tokoh masyarakat, serta penentuan zonasi rehabilitasi.",
            color: "bg-emerald-600 text-white border-emerald-600",
        },
        {
            icon: <Trash2 className="w-5 h-5" />,
            title: "Clean-up Pesisir & Area Tanam",
            date: "Februari 2026",
            desc: "Pembersihan sampah plastik, jaring ikan bekas, dan limbah padat di lokasi rehabilitasi guna menjamin kelangsungan hidup bibit baru.",
            color: "bg-cyan-600 text-white border-cyan-600",
        },
        {
            icon: <BookOpen className="w-5 h-5" />,
            title: "Inventarisasi Vegetasi Eksisting",
            date: "Februari 2026",
            desc: "Pendataan jenis mangrove, kerapatan batang, dan pemetaan titik koordinat awal vegetasi pelindung abrasi di pesisir Semarang.",
            color: "bg-teal-600 text-white border-teal-600",
        },
        {
            icon: <UserPlus className="w-5 h-5" />,
            title: "Penyulaman & Penanaman Bibit Baru",
            date: "Maret 2026",
            desc: "Penanaman massal bibit Rhizophora dan Avicennia di titik-titik kritis yang mengalami degradasi sabuk hijau pesisir.",
            color: "bg-green-600 text-white border-green-600",
        },
        {
            icon: <Eye className="w-5 h-5" />,
            title: "Penyusunan Sistem & Monitoring Digital",
            date: "April 2026",
            desc: "Integrasi sistem informasi log monitoring mingguan, pemasangan tanda pelacak pertumbuhan, dan pembuatan situs dashboard.",
            color: "bg-sky-600 text-white border-sky-600",
        },
        {
            icon: <AreaChart className="w-5 h-5" />,
            title: "Analisis Perkembangan & Karbon",
            date: "Mei 2026",
            desc: "Mengevaluasi Survival Rate penanaman, mengukur tinggi batang secara berkala, dan membuat estimasi tCO2e Blue Carbon.",
            color: "bg-indigo-600 text-white border-indigo-600",
        },
        {
            icon: <Award className="w-5 h-5" />,
            title: "Penyerahan Laporan & Publikasi",
            date: "Juni 2026",
            desc: "Penyusunan dokumen hasil program, serah terima platform sistem informasi ke kelurahan, serta diseminasi publikasi KKN UNDIP.",
            color: "bg-brand-blue-dark text-white border-brand-blue-dark",
        },
    ];

    return (
        <section id="timeline" className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Caption */}
                <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-green-light/10 text-brand-green-dark">
                        Kronologi Kegiatan
                    </span>
                    <h2 className="text-3xl font-display font-extrabold text-brand-blue-dark">
                        Tahapan Program KKN Tematik UNDIP 2026
                    </h2>
                    <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                        Perjalanan dedikasi mahasiswa bersama masyarakat dalam merintis program digitalisasi data
                        hutan kemasyarakatan pesisir dari persiapan hingga luaran mandiri.
                    </p>
                </div>

                {/* Vertical Timeline Track */}
                <div className="relative max-w-4xl mx-auto">
                    {/* Vertical line through timeline */}
                    <div className="absolute left-4 sm:left-1/2 top-4 bottom-4 w-1 bg-slate-100 transform -translate-x-1/2 pointer-events-none" />

                    <div className="space-y-12 sm:space-y-16">
                        {steps.map((step, idx) => {
                            const isEven = idx % 2 === 0;

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6 }}
                                    className="flex flex-col sm:flex-row relative items-start sm:items-center justify-between"
                                >
                                    {/* Timeline Badge (Desktop) */}
                                    <div className={`w-full sm:w-[45%] ${isEven ? "sm:text-right" : "sm:order-last sm:text-left"} pl-12 sm:pl-0 space-y-2`}>
                                        <span className="inline-block text-[11px] font-extrabold text-brand-green-medium tracking-wider uppercase bg-brand-accent px-2.5 py-1 rounded-full">
                                            {step.date}
                                        </span>
                                        <h3 className="text-lg font-bold text-brand-blue-dark">
                                            {step.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm sm:ml-auto select-none">
                                            {step.desc}
                                        </p>
                                    </div>

                                    {/* Icon Node Center */}
                                    <div className="absolute left-4 sm:left-1/2 transform -translate-x-1/2 z-10">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md ${step.color}`}>
                                            {step.icon}
                                        </div>
                                    </div>

                                    {/* Spacer for two column desktop feel */}
                                    <div className="hidden sm:block w-[45%]" />
                                </motion.div>
                            );
                        })}
                    </div>

                </div>

            </div>
        </section>
    );
}
