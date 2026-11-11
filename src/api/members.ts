import { adminApi } from '@/lib';
import { normalizePaginated } from '@/lib/normalize';
import type { MemberSummary, MemberDetail, Paginated, MembershipStatus } from '@/types/api';

export const MembersApi = {
  list: async (q: Record<string, unknown> = {}): Promise<Paginated<MemberSummary[]>> => {
    const response = await adminApi.getMembers(q);
    return normalizePaginated<MemberSummary>(response, {
      page: typeof q.page === 'number' ? q.page : 1,
      pageSize: typeof q.pageSize === 'number' ? q.pageSize : 10,
    });
  },
  get: (id: string): Promise<MemberDetail> =>
    adminApi.getMember(id),
  create: (data: unknown): Promise<MemberDetail> =>
    adminApi.createMember(data),
  update: (id: string, data: unknown): Promise<MemberDetail> =>
    adminApi.updateMember(id, data),
  updateStatus: (id: string, status: MembershipStatus): Promise<MemberDetail> =>
    adminApi.updateMemberStatus(id, status),
  approve: (id: string): Promise<MemberDetail> =>
    adminApi.approveMember(id),
  reject: (id: string, reason: string): Promise<MemberDetail> =>
    adminApi.rejectMember(id, reason),
  delete: (id: string): Promise<{ success: boolean }> =>
    adminApi.deleteMember(id),
  getPendingCount: (): Promise<{ pendingCount: number }> =>
    adminApi.getPendingCount(),
  export: (filters: Record<string, unknown> = {}): Promise<Blob> =>
    adminApi.exportMembers(filters),
  getDocumentBlobUrl: (memberId: string, docId: string): Promise<string> =>
    adminApi.getMemberDocumentBlobUrl(memberId, docId),
  downloadDocument: (memberId: string, docId: string): Promise<Blob> =>
    adminApi.downloadMemberDocument(memberId, docId),
  getPayments: (memberId: string) =>
    adminApi.getMemberPayments(memberId),
};
