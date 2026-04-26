import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface Insight {
  id: string;
  content: string;
  category: 'SYMPTOM' | 'CYCLE' | 'WELLNESS' | 'GENERAL';
  createdAt: string;
}

export const useInsights = () => {
  return useQuery<Insight[]>({
    queryKey: ['insights', 'today'],
    queryFn: async () => {
      const res = await api.get('/insights/today');
      return res.data.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};
