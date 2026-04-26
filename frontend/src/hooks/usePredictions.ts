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
      const data = res.data.data;
      
      if (!data) return null;

      // Map AI fields to frontend interface
      return {
        ...data,
        predictedStartDate: data.predictedDate,
        confidence: data.confidence === 'HIGH' ? 95 : data.confidence === 'MEDIUM' ? 70 : 40,
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
