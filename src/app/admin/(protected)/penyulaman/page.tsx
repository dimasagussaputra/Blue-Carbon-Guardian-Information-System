"use client";

import { useState, useCallback } from "react";
import { Sprout } from "lucide-react";
import PenyulamanTable from "@/components/admin/Penyulaman/PenyulamanTable";
import PenyulamanForm from "@/components/admin/Penyulaman/PenyulamanForm";
import PenyulamanActions from "@/components/admin/Penyulaman/PenyulamanActions";
import PenyulamanStats from "@/components/admin/Penyulaman/PenyulamanStats";
import type { PenyulamanRecord } from "@/lib/penyulaman/types";

export default function PenyulamanPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<PenyulamanRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [gelombangFilter, setGelombangFilter] = useState("");

  const handleAdd = useCallback(() => {
    setEditRecord(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((record: PenyulamanRecord) => {
    setEditRecord(record);
    setFormOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleClose = useCallback(() => {
    setFormOpen(false);
    setEditRecord(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-green-medium/10">
              <Sprout className="size-5 text-brand-green-medium" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Penyulaman Mangrove
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Catat dan kelola kegiatan penyulaman bibit mangrove.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={gelombangFilter}
            onChange={(e) => setGelombangFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20"
          >
            <option value="">Semua Gelombang</option>
            <option value="1">Gelombang 1</option>
            <option value="2">Gelombang 2</option>
          </select>
          <PenyulamanActions
            onAdd={handleAdd}
            gelombang={gelombangFilter || undefined}
          />
        </div>
      </div>

      <PenyulamanStats key={"stats-" + refreshKey} gelombang={gelombangFilter || undefined} />

      <PenyulamanTable
        key={"table-" + refreshKey}
        onEdit={handleEdit}
        gelombang={gelombangFilter || undefined}
      />

      <PenyulamanForm
        open={formOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        editRecord={editRecord}
      />
    </div>
  );
}
