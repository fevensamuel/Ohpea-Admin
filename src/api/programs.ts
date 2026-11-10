import { adminApi } from '@/lib';
import type { ProgramItem } from '@/types/api';

export const ProgramsApi = {
  list: (): Promise<ProgramItem[]> => adminApi.getPrograms(),
  create: (data: unknown): Promise<ProgramItem> => adminApi.createProgram(data),
  update: (id: string, data: unknown): Promise<ProgramItem> => adminApi.updateProgram(id, data),
  delete: (id: string): Promise<{ success: boolean }> => adminApi.deleteProgram(id),
};
