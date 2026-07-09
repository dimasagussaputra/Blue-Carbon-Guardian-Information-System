"use client";

import { useState, useCallback } from "react";
import { Trees } from "lucide-react";
import TegakanTable from "@/components/admin/Tegakan/TegakanTable";
import TegakanForm from "@/components/admin/Tegakan/TegakanForm";
import TegakanActions from "@/components/admin/Tegakan/TegakanActions";
import type { TegakanRecord } from "@/lib/tegakan/types";

export default function InventarisasiTegakanPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<TegakanRecord | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdd = useCallback(() => {
    setEditRecord(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((record: TegakanRecord) => {
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
              <Trees className="size-5 text-brand-green-medium" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Inventarisasi Tegakan
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kelola data inventaris tegakan mangrove di kawasan Mangkang.
          </p>
        </div>
        <TegakanActions onAdd={handleAdd} />
      </div>

      <TegakanTable key={refreshKey} onEdit={handleEdit} />

      <TegakanForm
        open={formOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        editRecord={editRecord}
      />
    </div>
  );
}
