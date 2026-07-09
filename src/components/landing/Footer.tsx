"use client";

import React from "react";
import { TreePine, ChevronRight } from "lucide-react";

export default function Footer() {
    const links = [
        { label: "Home", href: "#home" },
        { label: "Tentang Program", href: "#tentang" },
        { label: "Statistik", href: "#statistik" },
        { label: "Peta Mangrove", href: "#peta" },
        { label: "Monitoring", href: "#monitoring" },
        { label: "Blue Carbon", href: "#blue-carbon" },
        { label: "Paket Wisata", href: "#wisata" },
        { label: "Timeline", href: "#timeline" },
        { label: "Galeri", href: "#galeri" },
        { label: "FAQ", href: "#faq" },
        { label: "Kontak", href: "#kontak" },
    ];

    return (
        <footer className="bg-brand-blue-deep text-slate-400 py-16 border-t border-white/5 relative z-10 select-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-12 pb-12 border-b border-white/5">
                    {/* Logo & Description */}
                    <div className="lg:col-span-4 space-y-4">
                        <a href="#home" className="flex items-center space-x-2 w-fit">
                            <div className="bg-brand-green-dark text-white p-2 rounded-lg">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-5 h-5 text-seafoam"
                                >
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <path d="M12 8v8M9 12h6" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-display font-extrabold text-base tracking-tight text-white leading-tight">
                                    BLUE CARBON
                                </span>
                                <span className="text-xs font-semibold text-brand-green-light tracking-wider uppercase leading-none">
                                    GUARDIAN
                                </span>
                            </div>
                        </a>
                        <p className="text-xs sm:text-sm text-slate-450 leading-relaxed font-normal">
                            Sistem Informasi Konservasi Mangrove terintegrasi untuk melestarikan lingkungan pesisir,
                            mencegah ancaman abrasi pesisir, dan mengukur kapasitas emisi karbon biru secara presisi.
                        </p>
                        <div className="pt-2 flex gap-3 text-white">
                            {/* Simple Social Media Links */}
                            {["instagram", "youtube", "twitter", "github"].map((social) => (
                                <a
                                    key={social}
                                    href={`#${social}`}
                                    className="p-2 bg-white/5 hover:bg-brand-green-medium/20 hover:text-brand-green-light rounded-lg transition-colors border border-white/5"
                                    aria-label={social}
                                >
                                    <span className="text-xs font-bold uppercase tracking-wider">{social.slice(0, 2)}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links Menu */}
                    <div className="lg:col-span-5 space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Navigasi Cepat Halaman
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {links.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="flex items-center gap-1 text-xs hover:text-white transition-colors duration-150 py-1"
                                >
                                    <ChevronRight className="w-3 h-3 text-brand-green-light shrink-0" />
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Credentials UNDIP */}
                    <div className="lg:col-span-3 space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Program KKN Universitas Diponegoro 2026
                        </h3>
                        <p className="text-xs text-slate-450 leading-relaxed">
                            Dikembangkan oleh Tim KKN Tematik Universitas Diponegoro 2026. Bekerja sama dengan
                            Kelompok Sadar Wisata (Darwis) Kelurahan Mangkang Kulon, Kota Semarang.
                        </p>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                            <TreePine className="w-5 h-5 text-brand-green-light shrink-0" />
                            <span>UNDIP Lestari & Mangkang Tangguh</span>
                        </div>
                    </div>

                </div>

                {/* Bottom Copyright */}
                <div className="pt-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
                    <span>
                        &copy; 2026 Blue Carbon Guardian Information System. Semua Hak Terlindungi.
                    </span>
                    <div className="flex gap-4">
                        <a href="#privacy" className="hover:text-slate-400">Kebijakan Privasi</a>
                        <a href="#terms" className="hover:text-slate-400">Syarat Ketentuan</a>
                    </div>
                </div>

            </div>
        </footer>
    );
}
