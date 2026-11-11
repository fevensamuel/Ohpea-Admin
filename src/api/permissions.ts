import { adminApi } from '@/lib';
import { normalizeList } from '@/lib/normalize';

export const PermissionsApi = {
  list: async (): Promise<string[]> => normalizeList(await adminApi.getPermissions()),
};
