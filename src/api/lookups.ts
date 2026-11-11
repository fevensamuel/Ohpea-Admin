import { adminApi } from '@/lib';
import { normalizeList } from '@/lib/normalize';
import type { LookupItem } from '@/types/api';

export const LookupsApi = {
  get: async (type: 'sectors' | 'fields' | 'graduation-levels'): Promise<LookupItem[]> =>
    normalizeList(await adminApi.getLookups(type)),
};
