import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '@/types/api';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function Pagination({ meta, onPageChange, onPageSizeChange }: PaginationProps) {
  // Only render pager when totalPages > 1
  if (meta.totalPages <= 1) {
    return null;
  }

  const { page, totalPages, total, pageSize } = meta;
  const startRow = (page - 1) * pageSize + 1;
  const endRow = Math.min(total, page * pageSize);

  // Generate page numbers
  const pages: number[] = [];
  const maxButtons = 5;
  let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-white rounded-b-xl text-xs text-slate-600"
      aria-label="Pagination Navigation"
    >
      <div className="flex items-center gap-2 tabular-nums">
        <span>
          Showing <strong className="font-semibold text-slate-800">{startRow}</strong> to{' '}
          <strong className="font-semibold text-slate-800">{endRow}</strong> of{' '}
          <strong className="font-semibold text-slate-800">{total}</strong> records
        </span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="ml-3 px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
            aria-label="Rows per page"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-lg text-xs font-medium tabular-nums transition-colors ${
              p === page
                ? 'bg-[#0B3D2E] text-white shadow-xs font-semibold'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
