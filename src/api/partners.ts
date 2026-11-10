import { adminApi } from '@/lib';
import type { PartnerItem } from '@/types/api';

export const PartnersApi = {
  list: (): Promise<PartnerItem[]> => adminApi.getPartners(),
  create: (data: unknown): Promise<PartnerItem> => adminApi.createPartner(data),
  update: (id: string, data: unknown): Promise<PartnerItem> => adminApi.updatePartner(id, data),
  delete: (id: string): Promise<{ success: boolean }> => adminApi.deletePartner(id),
};
