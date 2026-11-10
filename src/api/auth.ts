import { adminApi } from '@/lib';
import type { AdminUser } from '@/types/api';

export const AuthApi = {
  login: (usernameOrEmail: string, password: string): Promise<{ token: string; user: AdminUser }> =>
    adminApi.login(usernameOrEmail, password),
  me: (): Promise<AdminUser> => adminApi.me(),
  changePassword: (current: string, next: string): Promise<{ success: boolean; message: string }> =>
    adminApi.changePassword(current, next),
  logout: (): Promise<void> => adminApi.logout(),
};
