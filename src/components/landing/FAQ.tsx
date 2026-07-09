"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
    question: string;
    answer: string;
}

export default function FAQ() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const faqs: FAQItem[] = [
        {
            question: "Apa tujuan utama dari Blue Carbon Guardian Information System?",
            answer: "Sistem ini dikembangkan oleh KKN Tematik Universitas Diponegoro 2026 sebagai platform digital konservasi hutan bakau di pesisir Mangkang. Tujuannya adalah mendata jumlah tegakan pohon hidup, mencatat koordinat zonasi penanaman, serta melakukan pemantauan berkala guna mengestimasi penyerapan emisi karbon biru (Blue Carbon) secara transparan.",
        },
        {
            question: "Bagaimana cara sistem mengestimasi cadangan penyerapan Blue Carbon?",
            answer: "Perhitungan kuantitatif didasarkan pada persamaan alometrik spesies mangrove (seperti Rhizophora mucronata dan Avicennia marina) dengan input berupa diameter batang, kerapatan tegakan, dan umur tanaman. Hasil ini digabungkan dengan peta luas lahan dari citra satelit guna menghasilkan taksiran berat biomassa karbon atas tanah dan sedimen bawah tanah dalam satuan tCO₂e (ton CO₂ ekuivalen).",
        },
        {
            question: "Mengapa restotasi mangrove dipusatkan di kawasan pesisir Mangkang?",
            answer: "Pesisir Kecamatan Tugu, terutama Mangkang Kulon, memiliki kerentanan erosi pantai (abrasi) yang tinggi dan sering terdampak banjir pasang air laut (rob). Restorasi sabuk hijau (greenbelt) mangrove di sini mutlak diperlukan sebagai pelindung benteng alami guna menahan abrasi gelombang dan melestarikan tambak budidaya warga.",
        },
        {
            question: "Bagaimana masyarakat umum dapat berkontribusi dalam program konservasi ini?",
            answer: "Masyarakat umum dipersilakan mengambil bagian secara langsung dengan memesan paket wisata edukasi mangrove atau workshop karbon. Kontribusi tiket wisata dialokasikan seluruhnya ke kelompok sadar wisata (Darwis) Mangkang Kulon untuk membiayai pembibitan mandiri, penanaman ulang (penyulaman), dan biaya perawatan jangka panjang.",
        },
        {
            question: "Bagaimana cara mengakses dashboard monitoring admin sistem?",
            answer: "Dashboard admin ditujukan bagi perangkat Kelurahan Mangkang Kulon, perwakilan karang taruna, dan pengawas KKN UNDIP untuk memperbarui database lapangan. Klik tombol 'Login Admin' di pojok kanan atas Navbar untuk diarahkan ke portal login otentikasi resmi.",
        },
    ];

    return (
        <section id="faq" className="py-24 bg-white relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Caption */}
                <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-green-light/10 text-brand-green-dark">
                        Tanya Jawab
                    </span>
                    <h2 className="text-3xl font-display font-extrabold text-brand-blue-dark">
                        Pertanyaan Umum Seputar Program
                    </h2>
                    <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                        Menjawab informasi penting mengenai cara kerja pemantauan digital, kontribusi karbon biru,
                        hingga tata cara keterlibatan masyarakat pesisir.
                    </p>
                </div>

                {/* Custom Accordion list */}
                <div className="space-y-4">
                    {faqs.map((faq, idx) => {
                        const isActive = activeIndex === idx;

                        return (
                            <div
                                key={idx}
                                className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs bg-slate-50 hover:bg-white hover:border-brand-green-light/20 transition-all duration-300"
                            >
                                <button
                                    onClick={() => setActiveIndex(isActive ? null : idx)}
                                    className="w-full flex items-center justify-between p-5 text-left text-brand-blue-dark font-bold text-sm sm:text-base cursor-pointer"
                                >
                                    <span className="flex items-center gap-3">
                                        <HelpCircle className="w-5 h-5 text-brand-green-medium shrink-0" />
                                        {faq.question}
                                    </span>
                                    <ChevronDown
                                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${isActive ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                <AnimatePresence initial={false}>
                                    {isActive && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                        >
                                            <div className="px-5 pb-5 pt-1 text-slate-65 text-xs sm:text-sm leading-relaxed border-t border-slate-100 bg-white/50">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}
