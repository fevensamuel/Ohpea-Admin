import { adminApi } from '@/lib';
import type { PaymentRecord, MemberSummary, Paginated } from '@/types/api';

export const PaymentsApi = {
  list: (q: Record<string, unknown> = {}): Promise<Paginated<PaymentRecord[]>> =>
    adminApi.getPayments(q),
  create: (data: unknown): Promise<PaymentRecord> =>
    adminApi.createPayment(data),
  get: (id: string): Promise<PaymentRecord> =>
    adminApi.getPayment(id),
  void: (id: string, note: string): Promise<PaymentRecord> =>
    adminApi.voidPayment(id, note),
  downloadReceipt: (id: string): Promise<Blob> =>
    adminApi.downloadReceipt(id),
  getUnpaid: (params?: { period?: string; date?: string }): Promise<MemberSummary[]> =>
    adminApi.getUnpaidMembers(params),
  export: (filters: Record<string, unknown> = {}): Promise<Blob> =>
    adminApi.exportPayments(filters),
  sendReminders: (params: { period: string; date: string }): Promise<{ queuedCount: number }> =>
    adminApi.sendPaymentReminders(params),
};
