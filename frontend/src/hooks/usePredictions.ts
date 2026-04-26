import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface PredictionData {
  predictedStartDate: string;
  predictedLength: number;
  daysUntil: number;
  confidence: number;
  phase: 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATORY' | 'LUTEAL';
  cycleDay: number;
  symptomAdjustment: number;
}

export const usePredictions = () => {
  return useQuery<PredictionData>({
    queryKey: ['predictions', 'current'],
    queryFn: async () => {
      const res = await api.get('/predictions/current');
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
