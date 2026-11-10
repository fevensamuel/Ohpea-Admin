import { adminApi } from '@/lib';
import type { SmsCampaignItem, SmsLogItem, Paginated } from '@/types/api';

export const SmsApi = {
  send: (data: { memberId?: string; phone?: string; message: string }): Promise<{ success: boolean }> =>
    adminApi.sendSms(data),
  createCampaign: (data: unknown): Promise<SmsCampaignItem> =>
    adminApi.createSmsCampaign(data),
  getCampaigns: (params: Record<string, unknown> = {}): Promise<Paginated<SmsCampaignItem[]>> =>
    adminApi.getSmsCampaigns(params),
  getLogs: (params: Record<string, unknown> = {}): Promise<Paginated<SmsLogItem[]>> =>
    adminApi.getSmsLogs(params),
  getBalance: (): Promise<{ balance: number }> =>
    adminApi.getSmsBalance(),
};
