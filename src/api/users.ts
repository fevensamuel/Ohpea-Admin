import { adminApi } from '@/lib';
import type { AdminUser, Paginated } from '@/types/api';

export const UsersApi = {
  list: (params: Record<string, unknown> = {}): Promise<Paginated<AdminUser[]>> =>
    adminApi.getUsers(params),
  create: (data: unknown): Promise<AdminUser> =>
    adminApi.createUser(data),
  update: (id: string, data: unknown): Promise<AdminUser> =>
    adminApi.updateUser(id, data),
  setActive: (id: string, active: boolean): Promise<AdminUser> =>
    adminApi.setUserActive(id, active),
  resetPassword: (id: string): Promise<{ success: boolean; tempPassword?: string }> =>
    adminApi.resetUserPassword(id),
};
