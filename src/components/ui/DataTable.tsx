"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  pageSize?: number;
  loading?: boolean;
}

export function DataTable<TData>({
  columns,
  data,
  pageSize = 10,
  loading,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="hidden md:flex gap-4">
          {columns.map((_, i) => (
            <div key={i} className="h-10 flex-1 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, r) => (
          <div key={r} className="flex gap-4">
            {columns.map((_, c) => (
              <div key={c} className="h-12 flex-1 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider",
                      header.column.getCanSort() && "cursor-pointer select-none hover:text-slate-700"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <ChevronUp className="size-3.5" />,
                        desc: <ChevronDown className="size-3.5" />,
                      }[header.column.getIsSorted() as string] ?? (
                        header.column.getCanSort() && <ChevronsUpDown className="size-3.5 text-slate-300" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-slate-400"
                >
                  Tidak ada data
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {table.getRowModel().rows.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">Tidak ada data</p>
        ) : (
          table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-2"
            >
              {row.getVisibleCells().map((cell) => {
                const header = cell.column.columnDef.header;
                const value = cell.getContext().getValue();
                if (!value && value !== 0) return null;
                return (
                  <div key={cell.id} className="flex justify-between items-center text-sm">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {typeof header === "string" ? header : ""}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 text-right">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-xs text-slate-400">
            Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="size-4" />
            </button>
            {Array.from({ length: table.getPageCount() }).map((_, i) => (
              <button
                key={i}
                onClick={() => table.setPageIndex(i)}
                className={cn(
                  "w-7 h-7 rounded-lg text-xs font-semibold",
                  table.getState().pagination.pageIndex === i
                    ? "bg-brand-blue-dark text-white"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Halaman selanjutnya"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
