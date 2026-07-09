import {
  Activity,
  DatabaseBackup,
  Droplets,
  FileText,
  Images,
  LayoutDashboard,
  Leaf,
  Map,
  ClipboardList,
  Settings,
  Sprout,
  Trees,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    label: "Inventarisasi Tegakan",
    href: "/admin/inventarisasi-tegakan",
    icon: Trees,
  },
  { label: "Monitoring", href: "/admin/monitoring", icon: Activity },
  { label: "Penyulaman", href: "/admin/penyulaman", icon: Sprout },
  { label: "Kualitas Air", href: "/admin/kualitas-air", icon: Droplets },
  { label: "Blue Carbon", href: "/admin/blue-carbon", icon: Leaf },
  { label: "Peta", href: "/admin/peta", icon: Map },
  { label: "Galeri", href: "/admin/galeri", icon: Images },
  { label: "Dokumen", href: "/admin/dokumen", icon: FileText },
  { label: "Laporan", href: "/admin/laporan", icon: ClipboardList },
  {
    label: "Backup & Restore",
    href: "/admin/backup-restore",
    icon: DatabaseBackup,
  },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/admin/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
