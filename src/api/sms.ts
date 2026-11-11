import { adminApi } from '@/lib';
import { normalizePaginated } from '@/lib/normalize';
import type { SmsCampaignItem, SmsLogItem, Paginated } from '@/types/api';

export const SmsApi = {
  send: (data: { memberId?: string; phone?: string; message: string }): Promise<{ success: boolean }> =>
    adminApi.sendSms(data),
  createCampaign: (data: unknown): Promise<SmsCampaignItem> =>
    adminApi.createSmsCampaign(data),
  getCampaigns: async (params: Record<string, unknown> = {}): Promise<Paginated<SmsCampaignItem[]>> => {
    const response = await adminApi.getSmsCampaigns(params);
    return normalizePaginated<SmsCampaignItem>(response, {
      page: typeof params.page === 'number' ? params.page : 1,
      pageSize: typeof params.pageSize === 'number' ? params.pageSize : 10,
    });
  },
  getLogs: async (params: Record<string, unknown> = {}): Promise<Paginated<SmsLogItem[]>> => {
    const response = await adminApi.getSmsLogs(params);
    return normalizePaginated<SmsLogItem>(response, {
      page: typeof params.page === 'number' ? params.page : 1,
      pageSize: typeof params.pageSize === 'number' ? params.pageSize : 10,
    });
  },
  getBalance: (): Promise<{ balance: number }> =>
    adminApi.getSmsBalance(),
};
