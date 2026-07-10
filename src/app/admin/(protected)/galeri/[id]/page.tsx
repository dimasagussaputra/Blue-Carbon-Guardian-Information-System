"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Images } from "lucide-react";
import { LABEL_KATEGORI } from "@/lib/galeri/types";
import type { GaleriRecord, KategoriGaleri } from "@/lib/galeri/types";
import GaleriEditForm from "@/components/admin/Galeri/GaleriEditForm";

const kategoriColor: Record<string, string> = {
  before: "bg-amber-500",
  after: "bg-emerald-500",
  monitoring: "bg-blue-500",
  penyulaman: "bg-purple-500",
  edukasi: "bg-cyan-500",
  clean_up: "bg-rose-500",
};

export default function GaleriDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<GaleriRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const fetchRecord = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/galeri/${id}`);
      if (!res.ok) throw new Error("Not found");
      setRecord(await res.json());
    } catch {
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-brand-green-medium" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700">
          <Images className="size-8 text-slate-300 dark:text-slate-500" />
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Foto tidak ditemukan
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => router.push("/admin/galeri")}
        className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Galeri
      </button>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700/80 dark:bg-slate-800">
        <div className="flex flex-col lg:flex-row">
          <div className="relative flex-1 bg-slate-900">
            <img
              src={record.public_url}
              alt={record.judul}
              className="max-h-[70vh] w-full object-contain"
            />
          </div>

          <div className="w-full shrink-0 border-t border-slate-200 p-6 lg:w-80 lg:border-l lg:border-t-0 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white ${kategoriColor[record.kategori] || "bg-slate-500"}`}
              >
                {LABEL_KATEGORI[record.kategori as KategoriGaleri]}
              </span>
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-brand-green-medium/10 hover:text-brand-green-medium dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-brand-green-medium/20"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit
              </button>
            </div>

            {record.judul && (
              <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">
                {record.judul}
              </h1>
            )}

            {record.deskripsi && (
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {record.deskripsi}
              </p>
            )}

            {record.tanggal && (
              <p className="mt-3 text-xs font-medium text-brand-green-medium dark:text-brand-green-light">
                {new Date(record.tanggal).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}

          </div>
        </div>
      </div>

      <GaleriEditForm
        key={`detail-edit-${record.id}-${editOpen}`}
        open={editOpen}
        record={record}
        onClose={() => setEditOpen(false)}
        onSuccess={() => {
          fetchRecord();
          setEditOpen(false);
        }}
      />
    </div>
  );
}
