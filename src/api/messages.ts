import { adminApi } from '@/lib';
import { normalizePaginated } from '@/lib/normalize';
import type { ContactMessageItem, MessageStatus, Paginated } from '@/types/api';

export const MessagesApi = {
  list: async (params: { status?: MessageStatus; page?: number; pageSize?: number } = {}): Promise<Paginated<ContactMessageItem[]>> => {
    const response = await adminApi.getMessages(params);
    return normalizePaginated<ContactMessageItem>(response, params);
  },
  updateStatus: (id: string, status: MessageStatus): Promise<ContactMessageItem> =>
    adminApi.updateMessageStatus(id, status),
};
