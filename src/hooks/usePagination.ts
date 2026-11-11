import { useState, useCallback } from 'react';
import type { PaginationMeta } from '@/types/api';

export function usePagination(initialPage = 1, initialPageSize = 10) {
  const [page, setPageState] = useState<number>(initialPage);
  const [pageSize, setPageSizeState] = useState<number>(initialPageSize);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: initialPage,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 1,
  });

  const setPage = useCallback((p: number) => {
    setPageState(p);
  }, []);

  const setPageSize = useCallback((s: number) => {
    setPageSizeState(s);
    setPageState(1);
  }, []);

  const updateMeta = useCallback(
    (newMeta?: Partial<PaginationMeta> | null) => {
      if (!newMeta) return;

      const nextMeta = {
        page: newMeta.page ?? initialPage,
        pageSize: newMeta.pageSize ?? initialPageSize,
        total: newMeta.total ?? 0,
        totalPages:
          newMeta.totalPages ??
          Math.max(
            1,
            Math.ceil((newMeta.total ?? 0) / (newMeta.pageSize ?? initialPageSize))
          ),
      };
      setMeta(nextMeta);
      setPageState(nextMeta.page);
      setPageSizeState(nextMeta.pageSize);
    },
    [initialPage, initialPageSize]
  );

  const nextPage = useCallback(() => {
    if (page < meta.totalPages) {
      setPageState((p) => p + 1);
    }
  }, [page, meta.totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPageState((p) => p - 1);
    }
  }, [page]);

  return {
    page,
    pageSize,
    meta,
    setPage,
    setPageSize,
    updateMeta,
    nextPage,
    prevPage,
    canNextPage: page < meta.totalPages,
    canPrevPage: page > 1,
  };
}
