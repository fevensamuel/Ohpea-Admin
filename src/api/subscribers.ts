import { adminApi } from '@/lib';
import type { SubscriberItem, Paginated } from '@/types/api';

export const SubscribersApi = {
  list: (params: { page?: number; pageSize?: number } = {}): Promise<Paginated<SubscriberItem[]>> =>
    adminApi.getSubscribers(params),
  delete: (id: string): Promise<{ success: boolean }> =>
    adminApi.deleteSubscriber(id),
};
