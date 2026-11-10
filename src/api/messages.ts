import { adminApi } from '@/lib';
import type { ContactMessageItem, MessageStatus, Paginated } from '@/types/api';

export const MessagesApi = {
  list: (params: { status?: MessageStatus; page?: number; pageSize?: number } = {}): Promise<Paginated<ContactMessageItem[]>> =>
    adminApi.getMessages(params),
  updateStatus: (id: string, status: MessageStatus): Promise<ContactMessageItem> =>
    adminApi.updateMessageStatus(id, status),
};
