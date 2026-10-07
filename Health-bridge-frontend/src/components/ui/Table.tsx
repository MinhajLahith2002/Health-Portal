import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/90 shadow-sm bg-white">
    <table className={cn("w-full text-left text-sm text-slate-600", className)} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <thead
    className={cn(
      "bg-[#F8FAFC] text-xs uppercase font-semibold text-slate-500 border-b border-slate-200",
      className
    )}
    {...props}
  >
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <tbody className={cn("divide-y divide-slate-100", className)} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  children,
  ...props
}) => (
  <tr
    className={cn(
      "transition-colors hover:bg-[#EBF3FF]/50",
      className
    )}
    {...props}
  >
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <th className={cn("px-6 py-3.5 font-medium tracking-wider", className)} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <td className={cn("px-6 py-4 whitespace-nowrap text-sm", className)} {...props}>
    {children}
  </td>
);

export const TableEmpty: React.FC<{
  colSpan?: number;
  message?: string;
  description?: string;
}> = ({
  colSpan = 5,
  message = "No records found",
  description = "There is no data to display at this time.",
}) => (
  <tr>
    <td colSpan={colSpan} className="px-6 py-12 text-center">
      <p className="text-sm font-medium text-[#0A2540]">{message}</p>
      <p className="text-xs text-slate-400 mt-1">{description}</p>
    </td>
  </tr>
);

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords?: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
  pageSize = 10,
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-white rounded-b-2xl">
      <div className="text-xs text-slate-500">
        {totalRecords !== undefined ? (
          <>
            Showing{" "}
            <span className="font-semibold text-[#0A2540]">
              {Math.min((currentPage - 1) * pageSize + 1, totalRecords)}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-[#0A2540]">
              {Math.min(currentPage * pageSize, totalRecords)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#0A2540]">
              {totalRecords}
            </span>{" "}
            results
          </>
        ) : (
          `Page ${currentPage} of ${totalPages || 1}`
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-[#EBF3FF] hover:text-[#0052CC] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-medium px-2 text-[#0A2540]">
          {currentPage} / {totalPages || 1}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-[#EBF3FF] hover:text-[#0052CC] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Table;
