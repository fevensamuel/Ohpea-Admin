import { adminApi } from '@/lib';
import type { LookupItem } from '@/types/api';

export const LookupsApi = {
  get: (type: 'sectors' | 'fields' | 'graduation-levels'): Promise<LookupItem[]> =>
    adminApi.getLookups(type),
};
