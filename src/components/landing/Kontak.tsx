"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Compass } from "lucide-react";
import { motion } from "framer-motion";

export default function Kontak() {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: "", email: "", message: "" });
        }, 3000);
    };

    return (
        <section id="kontak" className="py-24 bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Caption */}
                <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-green-light/10 text-brand-green-dark">
                        Hubungi Kami
                    </span>
                    <h2 className="text-3xl font-display font-extrabold text-brand-blue-dark">
                        Ada Pertanyaan? Hubungi Tim Kami
                    </h2>
                    <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                        Silakan kirimkan pertanyaan, saran, atau koordinasi kunjungan konservasi Anda melalui
                        formulir yang tersedia atau kontak langsung di bawah ini.
                    </p>
                </div>

                {/* Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">

                    {/* Left Block: Info and Map */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-6">

                        {/* Contact Details */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-5">
                            <h3 className="font-bold text-slate-800 text-base">Informasi Kontak</h3>

                            <div className="space-y-4">

                                <div className="flex gap-3">
                                    <div className="p-2.5 bg-slate-50 rounded-xl text-brand-green-medium shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            Kantor Kesekretariatan
                                        </span>
                                        <span className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed">
                                            Kelurahan Mangkang Kulon, Kec. Tugu, Kota Semarang, Jawa Tengah 50155
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="p-2.5 bg-slate-50 rounded-xl text-brand-green-medium shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            Surel Resmi
                                        </span>
                                        <a href="mailto:kkn.mangkang@undip.ac.id" className="text-xs sm:text-sm text-slate-650 hover:text-brand-green-medium font-semibold underline">
                                            kkn.mangkang@undip.ac.id
                                        </a>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="p-2.5 bg-slate-50 rounded-xl text-brand-green-medium shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            Hotline Hubungan / WhatsApp
                                        </span>
                                        <a href="tel:+6281234567890" className="text-xs sm:text-sm text-slate-650 hover:text-brand-green-medium font-semibold">
                                            +62 812-3456-7890
                                        </a>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Google Maps Mockup Panel */}
                        <div className="bg-brand-blue-dark text-white rounded-2.5xl overflow-hidden aspect-video flex-grow relative shadow-md border border-white/5 flex flex-col justify-end p-5 min-h-[180px]">
                            <div className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none" style={{ backgroundImage: "url('/mangrove_hero.png')" }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-deep via-brand-blue-deep/60 to-transparent pointer-events-none" />

                            <div className="relative z-10 flex flex-col gap-2">
                                <div className="p-2 bg-white/10 w-fit rounded-lg border border-white/10">
                                    <Compass className="w-5 h-5 text-brand-green-light" />
                                </div>
                                <h4 className="text-xs uppercase font-bold text-slate-35">
                                    Titik Lokasi Google Maps
                                </h4>
                                <p className="text-[11px] text-slate-300 leading-snug">
                                    Temukan rute menuju kawasan Ekowisata Mangrove Mangkang Kulon di aplikasi navigasi Anda.
                                </p>
                                <div className="pt-2">
                                    <a
                                    href="https://www.google.com/maps/dir/?api=1&destination=-6.9678,110.3124"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-green-medium/30 hover:bg-brand-green-medium/50 rounded-md border border-brand-green-medium text-[10px] font-bold text-brand-green-light transition-colors"
                                >
                                    <MapPin className="w-3 h-3" />
                                    GPS: -6.9678° S, 110.3124° E
                                </a>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Block: Message Form */}
                    <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg mb-2">Kirim Pesan</h3>
                            <p className="text-xs text-slate-400 mb-6 font-medium">
                                Pesan Anda akan langsung masuk ke inbox pengelolaan konservasi Tim KKN UNDIP.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">

                                <div className="space-y-1.5">
                                    <label htmlFor="name" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-xs sm:text-sm font-semibold focus:outline-none focus:bg-white focus:border-brand-green-medium focus:ring-2 focus:ring-brand-green-medium/20 transition-all duration-200"
                                        placeholder="Contoh: Dimas Saputra"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                        Alamat Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-xs sm:text-sm font-semibold focus:outline-none focus:bg-white focus:border-brand-green-medium focus:ring-2 focus:ring-brand-green-medium/20 transition-all duration-200"
                                        placeholder="Contoh: dimas@gmail.com"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="message" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                        Pesan Detail
                                    </label>
                                    <textarea
                                        id="message"
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-xs sm:text-sm font-semibold focus:outline-none focus:bg-white focus:border-brand-green-medium focus:ring-2 focus:ring-brand-green-medium/20 transition-all duration-200 resize-none"
                                        placeholder="Tuliskan pertanyaan atau koordinasi kunjungan Anda..."
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-brand-green-medium hover:bg-brand-green-dark shadow-md shadow-brand-green-medium/10 transition-colors cursor-pointer"
                                    >
                                        <Send className="w-4 h-4" />
                                        Kirim Pesan Sekarang
                                    </button>
                                </div>

                            </form>
                        </div>

                        {/* Submitted Alert state */}
                        {submitted && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold text-center border border-emerald-200"
                            >
                                ✓ Terima kasih! Pesan Anda telah berhasil dikirim. Kami akan membalas segera.
                            </motion.div>
                        )}

                    </div>

                </div>

            </div>
        </section>
    );
}
