import { adminApi } from '@/lib';
import { normalizeList } from '@/lib/normalize';
import type { ObjectiveItem } from '@/types/api';

export const ObjectivesApi = {
  list: async (): Promise<ObjectiveItem[]> => normalizeList(await adminApi.getObjectives()),
  create: (data: unknown): Promise<ObjectiveItem> => adminApi.createObjective(data),
  update: (id: string, data: unknown): Promise<ObjectiveItem> => adminApi.updateObjective(id, data),
  delete: (id: string): Promise<{ success: boolean }> => adminApi.deleteObjective(id),
};
