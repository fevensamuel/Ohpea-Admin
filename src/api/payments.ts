import { adminApi } from '@/lib';
import { normalizeList, normalizePaginated } from '@/lib/normalize';
import type { PaymentRecord, MemberSummary, Paginated } from '@/types/api';

export const PaymentsApi = {
  list: async (q: Record<string, unknown> = {}): Promise<Paginated<PaymentRecord[]>> => {
    const response = await adminApi.getPayments(q);
    return normalizePaginated<PaymentRecord>(response, {
      page: typeof q.page === 'number' ? q.page : 1,
      pageSize: typeof q.pageSize === 'number' ? q.pageSize : 10,
    });
  },
  create: (data: unknown): Promise<PaymentRecord> =>
    adminApi.createPayment(data),
  get: (id: string): Promise<PaymentRecord> =>
    adminApi.getPayment(id),
  void: (id: string, note: string): Promise<PaymentRecord> =>
    adminApi.voidPayment(id, note),
  downloadReceipt: (id: string): Promise<Blob> =>
    adminApi.downloadReceipt(id),
  getUnpaid: async (params?: { period?: string; date?: string }): Promise<MemberSummary[]> =>
    normalizeList(await adminApi.getUnpaidMembers(params)),
  export: (filters: Record<string, unknown> = {}): Promise<Blob> =>
    adminApi.exportPayments(filters),
  sendReminders: (params: { period: string; date: string }): Promise<{ queuedCount: number }> =>
    adminApi.sendPaymentReminders(params),
};
