import { adminApi } from '@/lib';
import { normalizeList } from '@/lib/normalize';

export const PermissionsApi = {
  list: async (): Promise<{ key: string; label: string }[]> => normalizeList<{ key: string; label: string }>(await adminApi.getPermissions()),
};
