import { adminApi } from '@/lib';

export const SettingsApi = {
  get: <T = unknown>(key: string): Promise<T> => adminApi.getSetting<T>(key),
  update: (key: string, value: unknown): Promise<{ success: boolean }> =>
    adminApi.updateSetting(key, value),
};
