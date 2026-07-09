"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Trash2,
  Loader2,
  AlertTriangle,
  History,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import type {
  BlueCarbonRecord,
  BlueCarbonListResponse,
} from "@/lib/blue-carbon/types";

interface BlueCarbonHistoryProps {
  refreshKey: number;
}

export default function BlueCarbonHistory({ refreshKey }: BlueCarbonHistoryProps) {
  const [data, setData] = useState<BlueCarbonRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sorting.length > 0) {
        params.set("sortBy", sorting[0].id);
        params.set("sortOrder", sorting[0].desc ? "desc" : "asc");
      }
      params.set("page", String(page));
      params.set("limit", String(limit));

      const res = await fetch(`/api/blue-carbon?${params.toString()}`);
      const result: BlueCarbonListResponse = await res.json();

      setData(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      toast.error("Gagal memuat riwayat kalkulasi");
    } finally {
      setLoading(false);
    }
  }, [sorting, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  useEffect(() => {
    setPage(1);
  }, []);

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/blue-carbon/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus");
      setDeleteConfirm(null);
      fetchData();
      toast.success("Riwayat kalkulasi berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus riwayat kalkulasi");
    } finally {
      setDeleting(false);
    }
  }

  const columns = useMemo<ColumnDef<BlueCarbonRecord>[]>(
    () => [
      {
        accessorKey: "created_at",
        header: "Tanggal",
        cell: ({ getValue }) => {
          const val = getValue() as string;
          if (!val) return "-";
          const d = new Date(val);
          return d.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        },
      },
      {
        accessorKey: "area_ha",
        header: "Luas (ha)",
        cell: ({ getValue }) => (
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {(getValue() as number).toLocaleString("id-ID")}
          </span>
        ),
      },
      {
        accessorKey: "mangrove_type",
        header: "Jenis",
        cell: ({ getValue }) => {
          const val = getValue() as string;
          const labels: Record<string, string> = {
            rhizophora_mucronata: "R. mucronata",
            avicennia_marina: "A. marina",
            sonneratia_alba: "S. alba",
            rhizophora_apiculata: "R. apiculata",
            bruguiera_gymnorhiza: "B. gymnorhiza",
          };
          return (
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {labels[val] ?? val}
            </span>
          );
        },
      },
      {
        accessorKey: "karbon_kg",
        header: "Karbon",
        cell: ({ getValue }) => {
          const val = Number(getValue());
          return (
            <span className="text-slate-700 dark:text-slate-300">
              {(val / 1000).toFixed(2)}{" "}
              <span className="text-xs text-slate-400 dark:text-slate-500">ton C</span>
            </span>
          );
        },
      },
      {
        accessorKey: "co2_ekuivalen",
        header: "CO₂e",
        cell: ({ getValue }) => {
          const val = Number(getValue());
          return (
            <span className="text-slate-700 dark:text-slate-300">
              {(val / 1000).toFixed(2)}{" "}
              <span className="text-xs text-slate-400 dark:text-slate-500">ton</span>
            </span>
          );
        },
      },
      {
         accessorKey: "nilai_ekonomi",
         header: "Nilai (USD)",
         cell: ({ getValue }) => {
           const val = Number(getValue());
           return (
             <span className="font-medium text-brand-green-medium">
               ${val.toLocaleString("en-US", { minimumFractionDigits: 2 })}
             </span>
           );
         },
       },
       {
         accessorKey: "nilai_ekonomi_idr",
         header: "Nilai (IDR)",
         cell: ({ getValue }) => {
           const val = Number(getValue());
           return (
             <span className="font-medium text-violet-600">
               Rp{val.toLocaleString("id-ID", { minimumFractionDigits: 2 })}
             </span>
           );
         },
       },
       {
         id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await fetch(
                    `/api/blue-carbon/export?id=${row.original.id}`
                  );
                  if (!res.ok) throw new Error();
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `BCG-BlueCarbon-${Date.now()}.xlsx`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                } catch {
                  toast.error("Gagal mengexport");
                }
              }}
              className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand-blue-light"
              title="Export Excel"
            >
              <Download className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteConfirm(row.original.id)}
              className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition hover:bg-red-50 hover:text-red-500"
              title="Hapus"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
  });

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800">
      <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-700 px-5 py-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
          <History className="size-4 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Riwayat Kalkulasi
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {total} kalkulasi tersimpan
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-brand-green-medium" />
          </div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Belum ada kalkulasi blue carbon.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-slate-100 dark:border-slate-700">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${
                        header.column.getCanSort()
                          ? "cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200"
                          : ""
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="text-slate-300">
                            {{
                              asc: <ChevronUp className="size-3.5" />,
                              desc: <ChevronDown className="size-3.5" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <ChevronsUpDown className="size-3.5" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-50 transition hover:bg-slate-50/50 dark:hover:bg-slate-700/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 px-4 py-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {total > 0
              ? `${(page - 1) * limit + 1}-${Math.min(page * limit, total)} dari ${total} kalkulasi`
              : "0 kalkulasi"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <span className="px-2 text-sm text-slate-600 dark:text-slate-400">
              {page} / {totalPages || 1}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <button
            type="button"
            onClick={() => !deleting && setDeleteConfirm(null)}
            className="absolute inset-0 bg-brand-blue-deep/60 backdrop-blur-sm"
            aria-label="Tutup"
          />
          <div className="relative z-10 mx-4 w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-red-100">
                <AlertTriangle className="size-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Hapus Riwayat</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Data yang dihapus tidak dapat dikembalikan.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && <Loader2 className="size-4 animate-spin" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
