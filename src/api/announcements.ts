import { adminApi } from '@/lib';
import type { AnnouncementItem } from '@/types/api';

export const AnnouncementsApi = {
  list: (q: Record<string, unknown> = {}): Promise<AnnouncementItem[]> =>
    adminApi.getAnnouncements(q),
  get: (id: string): Promise<AnnouncementItem> =>
    adminApi.getAnnouncement(id),
  create: (data: unknown): Promise<AnnouncementItem> =>
    adminApi.createAnnouncement(data),
  update: (id: string, data: unknown): Promise<AnnouncementItem> =>
    adminApi.updateAnnouncement(id, data),
  publish: (id: string): Promise<AnnouncementItem> =>
    adminApi.publishAnnouncement(id),
  archive: (id: string): Promise<AnnouncementItem> =>
    adminApi.archiveAnnouncement(id),
  delete: (id: string): Promise<{ success: boolean }> =>
    adminApi.deleteAnnouncement(id),
};
