"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Leaf, LogOut, X } from "lucide-react";
import {
  ADMIN_NAV_ITEMS,
  isNavItemActive,
} from "@/lib/admin/navigation";
import { useAuth } from "@/contexts/AuthProvider";

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  userEmail?: string | null;
  userRole?: string;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

function getInitials(email?: string | null): string {
  if (!email) return "A";
  const name = email.split("@")[0];
  return name.slice(0, 2).toUpperCase();
}

export default function AdminSidebar({
  collapsed,
  mobileOpen,
  userEmail,
  userRole = "admin",
  onToggleCollapse,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const showLabels = !collapsed || mobileOpen;

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  const handleLogout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const sidebarContent = (
    <>
      <div className={`relative flex h-16 shrink-0 items-center border-b border-white/10 px-4 transition-all ${
        collapsed && !mobileOpen ? "justify-center" : "justify-between"
      }`}>
        <Link
          href="/admin/dashboard"
          className="flex min-w-0 items-center gap-3 overflow-hidden"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-green-medium/20">
            <Leaf className="size-5 text-brand-green-light" />
          </div>
          {showLabels && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                BCG Admin
              </p>
              <p className="truncate text-[11px] text-white/50">
                Blue Carbon Guardian
              </p>
            </div>
          )}
        </Link>

        {mobileOpen && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Collapse toggle — centered on the right border */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="absolute -right-4 top-8 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-brand-blue-deep text-white/70 shadow-sm transition hover:bg-white/10 hover:text-white lg:flex"
        aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
      >
        {collapsed ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
      </button>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 min-h-0">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={!showLabels ? item.label : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${active
                ? "bg-brand-green-medium/20 text-brand-green-light shadow-sm"
                : "text-white/70 hover:bg-white/5 hover:text-white"
                } ${!showLabels ? "justify-center px-2" : ""}`}
            >
              <Icon
                className={`size-[18px] shrink-0 ${active ? "text-brand-green-light" : "text-white/60 group-hover:text-white"
                  }`}
              />
              {showLabels && <span className="truncate">{item.label}</span>}
              {active && showLabels && (
                <span className="ml-auto size-1.5 shrink-0 rounded-full bg-brand-green-light" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-1 border-t border-white/10 p-3">
        {/* User card with logout dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white ${!showLabels ? "justify-center px-2" : ""}`}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-blue-medium text-xs font-bold text-white">
              {getInitials(userEmail)}
            </div>
            {showLabels && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-white">{userEmail ?? "Admin"}</p>
                  <p className="text-[11px] text-white/50 capitalize">{userRole}</p>
                </div>
                <ChevronDown className={`size-4 shrink-0 text-white/40 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
              </>
            )}
          </button>

          {userMenuOpen && showLabels && (
            <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-full rounded-xl border border-white/10 bg-brand-blue-dark p-1 shadow-xl">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <LogOut className="size-[18px] shrink-0" />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>

        <Link
          href="/"
          title={!showLabels ? "Situs Publik" : undefined}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white ${!showLabels ? "justify-center px-2" : ""
            }`}
        >
          <ExternalLink className="size-[18px] shrink-0" />
          {showLabels && <span>Situs Publik</span>}
        </Link>
      </div>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup overlay"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-brand-blue-deep/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-brand-blue-deep transition-[width,transform] duration-300 ease-in-out lg:z-30 ${collapsed && !mobileOpen ? "w-[72px]" : "w-[260px]"
          } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
