import { adminApi } from '@/lib';
import { normalizeList } from '@/lib/normalize';
import type { ActivityItem } from '@/types/api';

export const ActivitiesApi = {
  list: async (): Promise<ActivityItem[]> => normalizeList(await adminApi.getActivities()),
  create: (data: unknown): Promise<ActivityItem> => adminApi.createActivity(data),
  update: (id: string, data: unknown): Promise<ActivityItem> => adminApi.updateActivity(id, data),
  delete: (id: string): Promise<{ success: boolean }> => adminApi.deleteActivity(id),
};
