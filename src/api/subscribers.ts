import { adminApi } from '@/lib';
import { normalizePaginated } from '@/lib/normalize';
import type { SubscriberItem, Paginated } from '@/types/api';

export const SubscribersApi = {
  list: async (params: { page?: number; pageSize?: number } = {}): Promise<Paginated<SubscriberItem[]>> => {
    const response = await adminApi.getSubscribers(params);
    return normalizePaginated<SubscriberItem>(response, params);
  },
  delete: (id: string): Promise<{ success: boolean }> =>
    adminApi.deleteSubscriber(id),
};
