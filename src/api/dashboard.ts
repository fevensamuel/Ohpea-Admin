import { adminApi } from '@/lib';
import type {
  DashboardSummary,
  DashboardDimensionItem,
  ContributionSnapshot,
  RecentActivityItem,
} from '@/types/api';

export const DashboardApi = {
  getSummary: (params?: { regionId?: string }): Promise<DashboardSummary> =>
    adminApi.getDashboardSummary(params),
  getMembersBy: (params: {
    dimension: 'gender' | 'sector' | 'field' | 'occupation' | 'region' | 'graduationLevel';
    lang?: 'en' | 'om' | 'am';
    regionId?: string;
  }): Promise<DashboardDimensionItem[]> =>
    adminApi.getDashboardMembersBy(params),
  getContributions: (params?: {
    range?: '3m' | '6m' | '12m';
    group?: 'week' | 'month' | 'year';
    regionId?: string;
  }): Promise<ContributionSnapshot> =>
    adminApi.getDashboardContributions(params),
  getRecentActivity: (): Promise<RecentActivityItem[]> =>
    adminApi.getRecentActivity(),
};
