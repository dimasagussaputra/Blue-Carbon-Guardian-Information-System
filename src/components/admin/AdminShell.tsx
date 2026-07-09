"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

const SIDEBAR_COLLAPSED_KEY = "bcg_admin_sidebar_collapsed";

interface AdminShellProps {
  children: ReactNode;
  userEmail?: string | null;
  userRole?: string;
}

export default function AdminShell({
  children,
  userEmail,
  userRole,
}: AdminShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        userEmail={userEmail}
        userRole={userRole}
        onToggleCollapse={handleToggleCollapse}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={`flex min-h-screen flex-col transition-[margin] duration-300 ease-in-out max-lg:ml-0 ${
          collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
        }`}
      >
        <AdminTopbar
          userEmail={userEmail}
          userRole={userRole}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 text-slate-900 dark:text-slate-100">{children}</main>
      </div>
    </div>
  );
}
