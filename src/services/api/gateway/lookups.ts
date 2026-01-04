import api from '@/lib/axios';

export type LookupItem = {
  id: number | string;
  name: string;
  normalized_term?: string;
  meta?: any;
};

// Generic lookup endpoint for small lists (/lookups/{entity}) and search fallback
export const getLookup = async (entity: string): Promise<LookupItem[]> => {
  const response = await api.get<{ items: LookupItem[] }>(`/lookups/${entity}`);
  return response.data.items || [];
};

export const searchLookup = async (entity: string, q: string, limit = 10, offset = 0) => {
  const response = await api.get<{
    items: LookupItem[];
    total: number;
  }>(`/search/${entity}`, { params: { q, limit, offset } });
  return response.data;
};
