import { adminApi } from '@/lib';
import type { RegionItem } from '@/types/api';

export const RegionsApi = {
  list: (): Promise<RegionItem[]> => adminApi.getRegions(),
  create: (data: unknown): Promise<RegionItem> => adminApi.createRegion(data),
  update: (id: string, data: unknown): Promise<RegionItem> => adminApi.updateRegion(id, data),
};
