import React, { useState } from 'react';

export interface TableColumn {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
}

export interface PatientTableProps {
  columns: TableColumn[];
  data: any[];
  emptyMessage?: string;
  itemsPerPage?: number;
}

export const PatientTable: React.FC<PatientTableProps> = ({ 
  columns, 
  data, 
  emptyMessage = "No records found.",
  itemsPerPage = 7
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate pagination boundaries
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="overflow-x-auto bg-white border border-zinc-200 rounded-xl shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-100 text-slate-700 border-b-2 border-slate-200">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-zinc-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            paginatedData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className="px-6 py-4 text-zinc-900">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {/* Pagination Controls Footer */}
      {data.length > itemsPerPage && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 bg-slate-50/50">
          <span className="text-sm text-zinc-500">
            Showing <span className="font-medium text-zinc-700">{startIndex + 1}</span> to <span className="font-medium text-zinc-700">{Math.min(startIndex + itemsPerPage, data.length)}</span> of <span className="font-medium text-zinc-700">{data.length}</span> entries
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-1.5 text-sm font-medium border border-zinc-300 text-zinc-700 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-1.5 text-sm font-medium border border-zinc-300 text-zinc-700 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
