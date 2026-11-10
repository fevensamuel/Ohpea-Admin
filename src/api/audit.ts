import { adminApi } from '@/lib';
import type { AuditLogItem, Paginated } from '@/types/api';

export const AuditApi = {
  list: (params: Record<string, unknown> = {}): Promise<Paginated<AuditLogItem[]>> =>
    adminApi.getAuditLogs(params),
};
