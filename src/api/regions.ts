import { adminApi } from '@/lib';
import { normalizeList } from '@/lib/normalize';
import type { RegionItem } from '@/types/api';

export const RegionsApi = {
  list: async (): Promise<RegionItem[]> => normalizeList(await adminApi.getRegions()),
  create: (data: unknown): Promise<RegionItem> => adminApi.createRegion(data),
  update: (id: string, data: unknown): Promise<RegionItem> => adminApi.updateRegion(id, data),
};
