import { adminApi } from '@/lib';
import type { ObjectiveItem } from '@/types/api';

export const ObjectivesApi = {
  list: (): Promise<ObjectiveItem[]> => adminApi.getObjectives(),
  create: (data: unknown): Promise<ObjectiveItem> => adminApi.createObjective(data),
  update: (id: string, data: unknown): Promise<ObjectiveItem> => adminApi.updateObjective(id, data),
  delete: (id: string): Promise<{ success: boolean }> => adminApi.deleteObjective(id),
};
