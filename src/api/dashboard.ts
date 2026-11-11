import { adminApi } from '@/lib';
import type {
  DashboardSummary,
  DashboardDimensionItem,
  ContributionSnapshot,
  RecentActivityItem,
} from '@/types/api';

type DashboardSummaryResponse = Partial<DashboardSummary> & {
  active?: number;
  inactive?: number;
  pending?: number;
  pendingRegistrations?: number;
  female?: number;
  male?: number;
  governmentCount?: number;
  privateCount?: number;
  otherCount?: number;
  activeMembers?: number;
  inactiveMembers?: number;
  pendingMembers?: number;
  femaleMembers?: number;
  maleMembers?: number;
  governmentMembers?: number;
  privateMembers?: number;
  otherMembers?: number;
  newThisMonth?: number;
};

export const DashboardApi = {
  getSummary: async (params?: { regionId?: string }): Promise<DashboardSummary> => {
    const raw = (await adminApi.getDashboardSummary(params)) as DashboardSummaryResponse;
    const activeMembers = raw.activeMembers ?? raw.active ?? 0;
    const inactiveMembers = raw.inactiveMembers ?? raw.inactive ?? 0;
    const pendingMembers = raw.pendingMembers ?? raw.pending ?? 0;
    const femaleMembers = raw.femaleMembers ?? raw.female ?? 0;
    const maleMembers = raw.maleMembers ?? raw.male ?? 0;
    const governmentMembers =
      raw.governmentMembers ?? raw.governmentSector ?? raw.governmentCount ?? 0;
    const privateMembers = raw.privateMembers ?? raw.privateSector ?? raw.privateCount ?? 0;
    const otherMembers = raw.otherMembers ?? raw.otherCount ?? 0;

    return {
      ...raw,
      totalMembers: raw.totalMembers ?? 0,
      active: raw.active ?? activeMembers,
      inactive: raw.inactive ?? inactiveMembers,
      pending: raw.pending ?? pendingMembers,
      pendingRegistrations: raw.pendingRegistrations ?? 0,
      female: raw.female ?? femaleMembers,
      male: raw.male ?? maleMembers,
      governmentCount: raw.governmentCount ?? governmentMembers,
      privateCount: raw.privateCount ?? privateMembers,
      otherCount: raw.otherCount ?? otherMembers,
      activeMembers,
      inactiveMembers,
      pendingMembers,
      femaleMembers,
      maleMembers,
      governmentMembers,
      privateMembers,
      otherMembers,
      governmentSector: raw.governmentSector ?? governmentMembers,
      privateSector: raw.privateSector ?? privateMembers,
      totalCollectedThisYear: raw.totalCollectedThisYear ?? 0,
      totalCollectedThisMonth: raw.totalCollectedThisMonth ?? 0,
      unpaidMembersCount: raw.unpaidMembersCount ?? 0,
      newThisMonth: raw.newThisMonth ?? 0,
    };
  },
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
