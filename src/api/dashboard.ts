import { adminApi } from '@/lib';
import {
  asNumber,
  asString,
  normalizeChartArray,
  normalizeList,
} from '@/lib/normalize';
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
    const raw = (await adminApi.getDashboardSummary(params)) as DashboardSummaryResponse | null;
    const response = raw ?? {};
    const activeMembers = asNumber(response.activeMembers ?? response.active);
    const inactiveMembers = asNumber(response.inactiveMembers ?? response.inactive);
    const pendingMembers = asNumber(response.pendingMembers ?? response.pending);
    const femaleMembers = asNumber(response.femaleMembers ?? response.female);
    const maleMembers = asNumber(response.maleMembers ?? response.male);
    const governmentMembers =
      asNumber(response.governmentMembers ?? response.governmentSector ?? response.governmentCount);
    const privateMembers =
      asNumber(response.privateMembers ?? response.privateSector ?? response.privateCount);
    const otherMembers = asNumber(response.otherMembers ?? response.otherCount);

    return {
      ...response,
      totalMembers: asNumber(response.totalMembers),
      active: asNumber(response.active, activeMembers),
      inactive: asNumber(response.inactive, inactiveMembers),
      pending: asNumber(response.pending, pendingMembers),
      pendingRegistrations: asNumber(response.pendingRegistrations),
      female: asNumber(response.female, femaleMembers),
      male: asNumber(response.male, maleMembers),
      governmentCount: asNumber(response.governmentCount, governmentMembers),
      privateCount: asNumber(response.privateCount, privateMembers),
      otherCount: asNumber(response.otherCount, otherMembers),
      activeMembers,
      inactiveMembers,
      pendingMembers,
      femaleMembers,
      maleMembers,
      governmentMembers,
      privateMembers,
      otherMembers,
      governmentSector: asNumber(response.governmentSector, governmentMembers),
      privateSector: asNumber(response.privateSector, privateMembers),
      totalCollectedThisYear: asNumber(response.totalCollectedThisYear),
      totalCollectedThisMonth: asNumber(response.totalCollectedThisMonth),
      unpaidMembersCount: asNumber(response.unpaidMembersCount),
      newThisMonth: asNumber(response.newThisMonth),
    };
  },

  // FIX: preserve key/count/percent from normalizeChartPoint so any consumer
  // (charts, legends, dropdowns) gets the full shape, not a truncated one.
  getMembersBy: async (params: {
    dimension: 'gender' | 'sector' | 'field' | 'occupation' | 'region' | 'graduationLevel';
    lang?: 'en' | 'om' | 'am';
    regionId?: string;
  }): Promise<DashboardDimensionItem[]> => {
    const points = normalizeChartArray(await adminApi.getDashboardMembersBy(params));
    return points.map(({ key, label, count, percent, value, color }) => ({
      key,
      label,
      value,
      count,
      percent,
      ...(color ? { color } : {}),
    }));
  },

  getContributions: async (params?: {
    range?: '3m' | '6m' | '12m';
    group?: 'week' | 'month' | 'year';
    regionId?: string;
  }): Promise<ContributionSnapshot> => {
    const raw = (await adminApi.getDashboardContributions(params)) as
      | (Partial<ContributionSnapshot> & Record<string, unknown>)
      | null;
    const response = raw ?? {};
    const rawTimeline = response.timeline ?? response.timeSeries;
    const timeline = rawTimeline != null
      ? normalizeList<Record<string, unknown>>(rawTimeline).map((point) => ({
          period: asString(point.period ?? point.bucket),
          amount: asNumber(point.amount ?? point.totalEtb),
          ...(point.target != null ? { target: asNumber(point.target) } : {}),
        }))
      : normalizeChartArray(response.byPeriod).map((point) => ({
          period: point.label,
          amount: point.value,
        }));
    const methodDistribution = response.methodDistribution != null
      ? normalizeList<Record<string, unknown>>(response.methodDistribution).map((point) => ({
          method: asString(point.method ?? point.label ?? point.key),
          amount: asNumber(point.amount ?? point.value ?? point.count),
        }))
      : normalizeChartArray(response.byMethod).map((point) => ({
          method: point.label,
          amount: point.value,
        }));
    const rawRegions = normalizeList<Record<string, unknown>>(response.byRegion);
    const byRegion = normalizeChartArray(rawRegions).map((point, index) => ({
      region: point.label,
      amount: point.value,
      unpaid: asNumber(rawRegions[index]?.unpaid),
    }));

    return {
      totalYear: asNumber(
        response.totalYear ?? response.totalCollectedThisYear ?? response.totalCollected
      ),
      totalMonth: asNumber(response.totalMonth ?? response.totalCollectedThisMonth),
      paidCount: asNumber(response.paidCount ?? response.paidMembers),
      unpaidCount: asNumber(response.unpaidCount ?? response.unpaidMembers),
      timeline,
      methodDistribution,
      byRegion,
    };
  },

  getRecentActivity: async (): Promise<RecentActivityItem[]> =>
    normalizeList(await adminApi.getRecentActivity()),
};