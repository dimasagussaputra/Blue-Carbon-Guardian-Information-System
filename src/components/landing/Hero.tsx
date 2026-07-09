"use client";

import React from "react";
import { ArrowRight, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section
            id="home"
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-blue-deep pt-20"
        >
            {/* Background image component with rich linear gradient overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-55 saturate-110"
                style={{ backgroundImage: "url('/mangrove_hero.png')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-deep via-brand-blue-dark/80 to-transparent z-1" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-blue-deep/95 via-transparent to-brand-blue-deep/90 z-1" />

            {/* Modern floating backdrop rings */}
            <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-brand-green-light/20 rounded-full blur-3xl animate-pulse-slow z-1 pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-brand-blue-light/10 rounded-full blur-3xl animate-pulse z-1 pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-6"
                >
                    {/* Tagline Badge */}
                    <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-brand-green-medium/20 text-brand-green-light border border-brand-green-medium/35 backdrop-blur-md uppercase tracking-wider"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-green-medium animate-ping" />
                        KKN Tematik UNDIP 2026 • Mangkang
                    </motion.span>

                    {/* Heading */}
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight"
                    >
                        <span className="block drop-shadow-md text-slate-100">
                            Blue Carbon Guardian
                        </span>
                        <span className="block mt-1.5 bg-gradient-to-r from-brand-green-light via-emerald-400 to-brand-blue-light bg-clip-text text-transparent drop-shadow-sm font-extrabold">
                            Information System
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-300 font-normal leading-relaxed drop-shadow"
                    >
                        Platform digital konservasi hutan bakau di pesisir Mangkang. Kami melacak
                        keberhasilan penanaman, pertumbuhan tegakan, dan mengestimasi penyerapan
                        emisi <strong>Blue Carbon</strong> untuk melestarikan keanekaragaman hayati laut.
                    </motion.p>

                    {/* Call to Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.8 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                    >
                        <a
                            href="#tentang"
                            className="group flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-full text-sm font-bold text-white bg-brand-green-medium hover:bg-brand-green-dark shadow-lg shadow-brand-green-medium/25 transition-all-custom duration-300 transform hover:-translate-y-0.5"
                        >
                            Pelajari Program
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>

                        <a
                            href="#monitoring"
                            className="group flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-full text-sm font-bold text-slate-100 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all-custom duration-300 transform hover:-translate-y-0.5 hover:border-slate-35"
                        >
                            <BarChart2 className="w-4 h-4 text-brand-green-light" />
                            Lihat Dashboard
                        </a>
                    </motion.div>
                </motion.div>


            </div>
        </section>
    );
}
