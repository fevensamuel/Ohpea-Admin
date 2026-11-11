import { adminApi } from '@/lib';
import { normalizeList } from '@/lib/normalize';
import type { ContributionPlan } from '@/types/api';

export const PlansApi = {
  list: async (): Promise<ContributionPlan[]> =>
    normalizeList(await adminApi.getContributionPlans()),
  create: (data: unknown): Promise<ContributionPlan> =>
    adminApi.createContributionPlan(data),
  update: (id: string, data: unknown): Promise<ContributionPlan> =>
    adminApi.updateContributionPlan(id, data),
  delete: (id: string): Promise<{ success: boolean }> =>
    adminApi.deleteContributionPlan(id),
};
