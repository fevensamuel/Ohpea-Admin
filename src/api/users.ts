import { adminApi } from '@/lib';
import { normalizePaginated } from '@/lib/normalize';
import type { AdminUser, Paginated } from '@/types/api';

export const UsersApi = {
  list: async (params: Record<string, unknown> = {}): Promise<Paginated<AdminUser[]>> => {
    const response = await adminApi.getUsers(params);
    return normalizePaginated<AdminUser>(response, {
      page: typeof params.page === 'number' ? params.page : 1,
      pageSize: typeof params.pageSize === 'number' ? params.pageSize : 10,
    });
  },
  create: (data: unknown): Promise<AdminUser> =>
    adminApi.createUser(data),
  update: (id: string, data: unknown): Promise<AdminUser> =>
    adminApi.updateUser(id, data),
  setActive: (id: string, active: boolean): Promise<AdminUser> =>
    adminApi.setUserActive(id, active),
  resetPassword: (id: string): Promise<{ success: boolean; tempPassword?: string }> =>
    adminApi.resetUserPassword(id),
};
