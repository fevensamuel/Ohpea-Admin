import { adminApi } from '@/lib';
import { normalizePaginated } from '@/lib/normalize';
import type { AuditLogItem, Paginated } from '@/types/api';

export const AuditApi = {
  list: async (params: Record<string, unknown> = {}): Promise<Paginated<AuditLogItem[]>> => {
    const response = await adminApi.getAuditLogs(params);
    return normalizePaginated<AuditLogItem>(response, {
      page: typeof params.page === 'number' ? params.page : 1,
      pageSize: typeof params.pageSize === 'number' ? params.pageSize : 10,
    });
  },
};
