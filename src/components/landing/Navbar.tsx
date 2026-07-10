"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, ShieldAlert, Key } from "lucide-react";

const NAV_ITEMS = [
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

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    function handleMobileNav(href: string) {
        const id = href.replace("#", "");
        setIsOpen(false);
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) {
                const top = el.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top, behavior: "smooth" });
            }
        }, 100);
    }

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 ${scrolled
                ? "bg-white/75 backdrop-blur-lg shadow-md"
                : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo / Brand */}
                    <a href="#home" className="flex items-center space-x-2 group">
                        <div className="bg-brand-green-dark text-white p-2 rounded-lg group-hover:bg-brand-green-medium transition-colors duration-300">
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
                            <span className={`font-display font-extrabold text-base tracking-tight leading-tight transition-colors duration-300 ${scrolled ? "text-brand-blue-dark" : "text-white/90"}`}>
                                BLUE CARBON
                            </span>
                            <span className={`text-xs font-semibold tracking-wider uppercase leading-none transition-colors duration-300 ${scrolled ? "text-brand-green-dark" : "text-white/70"}`}>
                                GUARDIAN
                            </span>
                        </div>
                    </a>

                    {/* Desktop Nav Items */}
                    <nav className="hidden xl:flex space-x-1">
                        {NAV_ITEMS.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 hover:text-brand-green-medium hover:bg-slate-100 ${scrolled ? "text-slate-700" : "text-white/90"
                                    }`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    {/* Action / CTA */}
                    <div className="hidden xl:flex items-center">
                        <a
                            href="/admin/login"
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold shadow-md transition-all-custom duration-300 transform hover:scale-105 active:scale-95 ${scrolled
                                ? "bg-brand-blue-dark text-white hover:bg-brand-blue-medium"
                                : "bg-white text-brand-blue-dark hover:bg-slate-100"
                                }`}
                        >
                            <Key className="w-3.5 h-3.5" />
                            Login
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="xl:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`p-2 rounded-md transition-colors ${scrolled ? "text-brand-blue-dark hover:bg-slate-100" : "text-white hover:bg-white/10"
                                }`}
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="xl:hidden bg-white border-t border-slate-100 shadow-xl overflow-hidden dark:bg-slate-900 dark:border-slate-700">
                    <div className="max-w-7xl mx-auto px-4 py-4 space-y-1.5">
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => handleMobileNav(item.href)}
                                className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-brand-accent hover:text-brand-green-dark transition-colors duration-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-brand-green-light"
                            >
                                {item.label}
                            </button>
                        ))}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                            <a
                                href="/admin/login"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-bold text-white bg-brand-blue-dark hover:bg-brand-blue-medium shadow-md transition-all duration-200"
                            >
                                <Key className="w-4 h-4" />
                                Login
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
