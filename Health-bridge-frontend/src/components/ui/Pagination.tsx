"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRecords?: number;
  pageSize?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalRecords,
  pageSize = 10,
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), safeTotalPages);
  const firstRecord = totalRecords ? (safeCurrentPage - 1) * pageSize + 1 : 0;
  const lastRecord = totalRecords
    ? Math.min(safeCurrentPage * pageSize, totalRecords)
    : 0;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-3.5 dark:border-slate-800 dark:bg-slate-900"
    >
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {totalRecords !== undefined
          ? `Showing ${firstRecord} to ${lastRecord} of ${totalRecords} results`
          : `Page ${safeCurrentPage} of ${safeTotalPages}`}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          title="Previous page"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-16 text-center text-xs font-medium text-slate-700 dark:text-slate-200">
          {safeCurrentPage} / {safeTotalPages}
        </span>
        <button
          type="button"
          aria-label="Next page"
          title="Next page"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === safeTotalPages}
          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
