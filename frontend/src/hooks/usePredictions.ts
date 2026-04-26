import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface PredictionData {
  predictedStartDate: string;
  predictedDate?: string;
  predictedLength?: number;
  finalPredictedLength?: number;
  daysUntil: number;
  confidence: number;
  phase: 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATORY' | 'LUTEAL';
  cycleDay: number;
  symptomAdjustment?: number;
  ovulationStart?: string;
  ovulationEnd?: string;
}

export const usePredictions = () => {
  return useQuery<PredictionData | null>({
    queryKey: ['predictions', 'current'],
    queryFn: async () => {
      try {
        const res = await api.get('/predictions/current');
        const data = res.data.data;
        if (!data) return null;
        return {
          ...data,
          predictedStartDate: data.predictedDate || data.predictedStartDate,
          confidence:
            data.confidence === 'HIGH' ? 95 :
            data.confidence === 'MEDIUM' ? 70 : 40,
        };
      } catch {
        return null;
      }
    },
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
};
