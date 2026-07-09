import {
  FileText,
  FileSpreadsheet,
  type LucideIcon,
} from "lucide-react";
import type { DokumenRecord } from "@/lib/dokumen/types";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isPDF(type: string): boolean {
  return type === "application/pdf";
}

export function isDOCX(type: string): boolean {
  return (
    type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

export function isXLSX(type: string): boolean {
  return (
    type ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
}

export function getFileIcon(type: string): LucideIcon {
  if (isXLSX(type)) return FileSpreadsheet;
  return FileText;
}

export function getFileIconColor(type: string): string {
  if (isPDF(type)) return "text-red-500";
  if (isDOCX(type)) return "text-blue-500";
  if (isXLSX(type)) return "text-emerald-500";
  return "text-slate-400";
}

export function getFileBadgeColor(type: string): string {
  if (isPDF(type)) return "bg-red-500";
  if (isDOCX(type)) return "bg-blue-500";
  if (isXLSX(type)) return "bg-emerald-500";
  return "bg-slate-500";
}

export function getFileExtension(type: string): string {
  if (isPDF(type)) return "PDF";
  if (isDOCX(type)) return "DOCX";
  if (isXLSX(type)) return "XLSX";
  return type.split("/").pop()?.toUpperCase() || "";
}

export function getFileExtensionFromName(name: string): string {
  return name.split(".").pop()?.toUpperCase() || "";
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getKategoriBadgeColor(kategori: string): string {
  const colors: Record<string, string> = {
    proposal: "bg-purple-500",
    laporan: "bg-blue-500",
    sop: "bg-amber-500",
    dokumentasi: "bg-cyan-500",
  };
  return colors[kategori] || "bg-slate-500";
}

export type PreviewTab = "preview" | "info";

export async function fetchFileAsArrayBuffer(
  url: string
): Promise<ArrayBuffer> {
  const res = await fetch(url);
  return res.arrayBuffer();
}
