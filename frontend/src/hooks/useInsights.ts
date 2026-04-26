import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface Insight {
  id: string;
  content: string;
  category: string;
  createdAt?: string;
  generatedAt?: string;
}

export const useInsights = () => {
  return useQuery<Insight[]>({
    queryKey: ['insights'],
    queryFn: async () => {
      const res = await api.get('/insights');
      return res.data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};
