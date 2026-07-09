"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Edit3,
  Trash2,
  Loader2,
  AlertTriangle,
  ImageIcon,
  X,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import type { TegakanRecord, TegakanListResponse } from "@/lib/tegakan/types";

interface TegakanTableProps {
  onEdit: (record: TegakanRecord) => void;
}

const SPESIES_OPTIONS = [
  "Rhizophora mucronata",
  "Avicennia marina",
  "Sonneratia alba",
  "Rhizophora apiculata",
  "Bruguiera gymnorhiza",
];

export default function TegakanTable({ onEdit }: TegakanTableProps) {
  const [data, setData] = useState<TegakanRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [spesiesFilter, setSpesiesFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "kode_tegakan", desc: false },
  ]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (spesiesFilter) params.set("spesies", spesiesFilter);
      if (sorting.length > 0) {
        params.set("sortBy", sorting[0].id);
        params.set("sortOrder", sorting[0].desc ? "desc" : "asc");
      }
      params.set("page", String(page));
      params.set("limit", String(limit));

      const res = await fetch(`/api/tegakan?${params.toString()}`);
      const result: TegakanListResponse = await res.json();

      setData(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      toast.error("Gagal memuat data tegakan");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, spesiesFilter, sorting, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, spesiesFilter]);

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/tegakan/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      setDeleteConfirm(null);
      fetchData();
      toast.success("Data tegakan berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus data tegakan");
    } finally {
      setDeleting(false);
    }
  }

  const columns = useMemo<ColumnDef<TegakanRecord>[]>(
    () => [
      {
        accessorKey: "kode_tegakan",
        header: "Kode",
        cell: ({ row }) => (
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {row.original.kode_tegakan}
          </span>
        ),
      },
      {
        accessorKey: "zona",
        header: "Zona",
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return val ? (
            <span className="text-slate-700 dark:text-slate-300">{val}</span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">-</span>
          );
        },
      },
      {
        accessorKey: "tanggal",
        header: "Tanggal",
        cell: ({ getValue }) => {
          const val = getValue() as string;
          if (!val) return "-";
          const d = new Date(val);
          return d.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
        },
      },
      {
        accessorKey: "spesies",
        header: "Spesies",
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return (
            <span className="text-slate-700 dark:text-slate-300">
              {val.length > 25 ? val.substring(0, 25) + "..." : val}
            </span>
          );
        },
      },
      {
        id: "foto",
        header: "Foto",
        cell: ({ row }) => {
          const url = row.original.foto_url;
          return url ? (
            <button
              type="button"
              onClick={() => setPreviewFoto(url)}
              className="group relative block h-10 w-10 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <img
                src={url}
                alt="Foto tegakan"
                className="size-full object-cover transition group-hover:scale-110"
              />
            </button>
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
              <ImageIcon className="size-4" />
            </span>
          );
        },
      },
      {
        accessorKey: "health_status",
        header: "Status",
        cell: ({ getValue }) => {
          const val = getValue() as string;
          const isHidup = val === "hidup";
          return (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isHidup
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                  : "bg-red-50 text-red-700 ring-1 ring-red-600/20"
              }`}
            >
              {isHidup ? "Hidup" : "Mati"}
            </span>
          );
        },
      },
      {
        id: "koordinat",
        header: () => (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            Koordinat
          </span>
        ),
        cell: ({ row }) => {
          const lat = row.original.latitude;
          const lng = row.original.longitude;
          return lat && lng ? (
            <span className="whitespace-nowrap text-xs text-slate-600 dark:text-slate-400">
              {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
            </span>
          ) : (
            <span className="text-xs text-slate-300 dark:text-slate-500">—</span>
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
              onClick={() => onEdit(row.original)}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-brand-green-medium dark:text-slate-500 dark:hover:bg-slate-700"
              title="Edit"
            >
              <Edit3 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteConfirm(row.original.id)}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:text-slate-500 dark:hover:bg-red-900/20"
              title="Hapus"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    [onEdit]
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
    <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700/80 dark:bg-slate-800">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center dark:border-slate-700">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Cari kode atau spesies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="">Semua Status</option>
            <option value="hidup">Hidup</option>
            <option value="mati">Mati</option>
          </select>
          <select
            value={spesiesFilter}
            onChange={(e) => setSpesiesFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 focus:border-brand-green-medium focus:outline-none focus:ring-2 focus:ring-brand-green-medium/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="">Semua Spesies</option>
            {SPESIES_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
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
              Belum ada data tegakan.
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
                          <span className="text-slate-300 dark:text-slate-500">
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
                  className="border-b border-slate-50 transition hover:bg-slate-50/50 dark:border-slate-700/50 dark:hover:bg-slate-700/30"
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

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {total > 0
            ? `${(page - 1) * limit + 1}-${Math.min(page * limit, total)} dari ${total} data`
            : "0 data"}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
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
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
          >
            Selanjutnya
          </button>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <button
            type="button"
            onClick={() => !deleting && setDeleteConfirm(null)}
            className="absolute inset-0 bg-brand-blue-deep/60 backdrop-blur-sm"
            aria-label="Tutup"
          />
          <div className="relative z-10 mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-red-100">
                <AlertTriangle className="size-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Hapus Data</h3>
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
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
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

      {previewFoto && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <button
            type="button"
            onClick={() => setPreviewFoto(null)}
            className="absolute inset-0 bg-brand-blue-deep/80 backdrop-blur-sm"
            aria-label="Tutup"
          />
          <div className="relative z-10 mx-4 max-h-[85vh] max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Foto Tegakan
              </h3>
              <button
                type="button"
                onClick={() => setPreviewFoto(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              >
                <X className="size-5" />
              </button>
            </div>
            <img
              src={previewFoto}
              alt="Foto tegakan"
              className="max-h-[70vh] w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
