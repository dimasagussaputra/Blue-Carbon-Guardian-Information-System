"use client";

import { Menu, Moon, Sun } from "lucide-react";
import { useThemeToggle } from "@/contexts/ThemeContext";

interface AdminTopbarProps {
  userEmail?: string | null;
  userRole?: string;
  onOpenMobileMenu: () => void;
}

export default function AdminTopbar({
  onOpenMobileMenu,
}: AdminTopbarProps) {
  const { theme, toggleTheme } = useThemeToggle();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/80 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Buka menu"
        >
          <Menu className="size-5" />
        </button>
        <div className="hidden sm:block">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Panel Admin
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Blue Carbon Guardian
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
        >
          {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
      </div>
    </header>
  );
}
