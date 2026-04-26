import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export interface SymptomLog {
  mood: string[];
  pain: number;
  energy: number;
  flow?: string;
  notes?: string;
}

export const useSymptoms = () => {
  const queryClient = useQueryClient();

  const logSymptom = useMutation({
    mutationFn: async (data: SymptomLog) => {
      const res = await api.post('/symptoms/log', data);
      return res.data.data;
    },
    onSuccess: () => {
      // Invalidate predictions and stats since new data might change them
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['symptoms'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });

  const getSymptomHistory = (days: number = 30) => {
    return useQuery({
      queryKey: ['symptoms', 'history', days],
      queryFn: async () => {
        const res = await api.get(`/symptoms/history?days=${days}`);
        return res.data.data;
      }
    });
  };

  return { logSymptom, getSymptomHistory };
};
