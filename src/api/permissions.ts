import { adminApi } from '@/lib';

export const PermissionsApi = {
  list: (): Promise<string[]> => adminApi.getPermissions(),
};
