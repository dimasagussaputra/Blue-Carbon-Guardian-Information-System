"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Command, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  type: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [open]);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data.results ?? []);
        setSelectedIndex(-1);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      navigate(results[selectedIndex].href);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 h-9 px-3 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300 min-w-[130px] sm:min-w-[160px] text-left"
        aria-label="Cari data (Ctrl+K)"
      >
        <Search className="size-4 shrink-0" />
        <span className="text-xs">Cari data...</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <button
            type="button"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Tutup pencarian"
          />
          <div className="relative z-10 w-full max-w-lg mx-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
              <Search className="size-4 shrink-0 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Cari tegakan, penyulaman, galeri..."
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
                autoComplete="off"
              />
              {loading && <Loader2 className="size-4 animate-spin text-slate-400" />}
              {query && !loading && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Hapus pencarian"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {results.length > 0 ? (
                <div className="py-2">
                  {results.map((result, idx) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      type="button"
                      onClick={() => navigate(result.href)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        idx === selectedIndex
                          ? "bg-brand-green-medium/10 text-brand-green-dark dark:text-brand-green-light"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="shrink-0 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        {result.type}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{result.label}</p>
                        {result.sublabel && (
                          <p className="text-xs text-slate-400 truncate">{result.sublabel}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : debouncedQuery.length >= 2 && !loading ? (
                <p className="px-4 py-8 text-center text-sm text-slate-400">
                  Tidak ditemukan hasil untuk &quot;{debouncedQuery}&quot;
                </p>
              ) : debouncedQuery.length < 2 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-400">
                  Ketik minimal 2 karakter untuk mencari
                </p>
              ) : null}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-2 flex items-center gap-4 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1 py-0.5 text-[10px]">↑↓</kbd> Navigasi
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1 py-0.5 text-[10px]">↵</kbd> Pilih
              </span>
              <span className="flex items-center gap-1 ml-auto">
                <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1 py-0.5 text-[10px]">Esc</kbd> Tutup
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
