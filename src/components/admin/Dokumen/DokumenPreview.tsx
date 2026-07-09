"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Download,
  Loader2,
  FileText,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import type { DokumenRecord } from "@/lib/dokumen/types";
import { LABEL_KATEGORI } from "@/lib/dokumen/types";
import {
  formatFileSize,
  formatDate,
  getFileIconColor,
  getFileExtension,
  getKategoriBadgeColor,
  isPDF,
  isDOCX,
  isXLSX,
} from "./utils";

interface DokumenPreviewProps {
  record: DokumenRecord | null;
  onClose: () => void;
}

type PreviewState = "loading" | "ready" | "error";

export default function DokumenPreview({
  record,
  onClose,
}: DokumenPreviewProps) {
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const loadPreview = useCallback(async () => {
    if (!record) return;

    setPreviewState("loading");
    setPreviewHtml(null);
    setErrorMsg("");

    try {
      if (isPDF(record.file_type)) {
        setPreviewState("ready");
        return;
      }

      const res = await fetch(record.public_url);
      if (!res.ok) throw new Error("Gagal mengunduh file");

      if (isDOCX(record.file_type)) {
        const buffer = await res.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
        setPreviewHtml(result.value);
        setPreviewState("ready");
      } else if (isXLSX(record.file_type)) {
        const buffer = await res.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const html = XLSX.utils.sheet_to_html(firstSheet, {
          id: "xlsx-preview",
          editable: false,
        });
        setPreviewHtml(html);
        setPreviewState("ready");
      } else {
        setPreviewState("ready");
      }
    } catch (err) {
      setPreviewState("error");
      setErrorMsg(err instanceof Error ? err.message : "Gagal memuat pratinjau");
    }
  }, [record]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  if (!record) return null;

  const ext = getFileExtension(record.file_type);

  return (
    <AnimatePresence>
      {record && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute inset-0 bg-brand-blue-deep/60 backdrop-blur-sm"
            aria-label="Tutup"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 mx-4 flex max-h-[85vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-xl dark:bg-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
              <div className="flex min-w-0 items-center gap-3">
                <div className={getFileIconColor(record.file_type)}>
                  {isXLSX(record.file_type) ? (
                    <FileSpreadsheet className="size-6 shrink-0" />
                  ) : (
                    <FileText className="size-6 shrink-0" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
                    {record.judul}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${getKategoriBadgeColor(record.kategori)}`}
                    >
                      {LABEL_KATEGORI[record.kategori]}
                    </span>
                    <span>{ext}</span>
                    <span>{formatFileSize(record.file_size)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={record.public_url}
                  download
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-green-medium px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-dark"
                >
                  <Download className="size-4" />
                  Download
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-auto p-0">
              {previewState === "loading" && (
                <div className="flex items-center justify-center py-24">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="size-8 animate-spin text-brand-green-medium" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Memuat pratinjau...
                    </p>
                  </div>
                </div>
              )}

              {previewState === "error" && (
                <div className="flex items-center justify-center py-24">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
                      <AlertCircle className="size-7 text-red-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Gagal memuat pratinjau
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {errorMsg}
                    </p>
                  </div>
                </div>
              )}

              {previewState === "ready" && isPDF(record.file_type) && (
                <iframe
                  src={record.public_url}
                  className="h-[65vh] w-full"
                  title={record.judul}
                />
              )}

              {previewState === "ready" &&
                isDOCX(record.file_type) &&
                previewHtml && (
                  <div className="p-6">
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  </div>
                )}

              {previewState === "ready" &&
                isXLSX(record.file_type) &&
                previewHtml && (
                  <div className="overflow-auto p-4">
                    <div
                      className="xlsx-preview"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  </div>
                )}

              {previewState === "ready" &&
                !isPDF(record.file_type) &&
                !isDOCX(record.file_type) &&
                !isXLSX(record.file_type) && (
                  <div className="flex items-center justify-center py-24">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Pratinjau tidak tersedia untuk tipe file ini.
                    </p>
                  </div>
                )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
