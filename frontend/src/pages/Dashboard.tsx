import React, { useEffect } from 'react';
import { ProgressRing } from '../components/dashboard/ProgressRing';
import { NextPeriodCard } from '../components/cards/NextPeriodCard';
import { InsightCard } from '../components/cards/InsightCard';
import { RecommendationChip } from '../components/cards/RecommendationChip';
import { Card } from '../components/ui/Card';
import { usePredictions } from '../hooks/usePredictions';
import { useInsights } from '../hooks/useInsights';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { PHASE_CONFIG } from '../utils/phase.utils';
import { Activity, Clock } from 'lucide-react';

const RECOMMENDATIONS: Record<string, Array<{ category: 'nutrition' | 'movement' | 'sleep' | 'wellness'; text: string }>> = {
  MENSTRUAL: [
    { category: 'nutrition', text: 'Iron-rich foods today' },
    { category: 'movement', text: 'Gentle stretching' },
    { category: 'sleep', text: '8+ hours sleep' },
  ],
  FOLLICULAR: [
    { category: 'movement', text: 'Cardio or strength' },
    { category: 'nutrition', text: 'Protein + leafy greens' },
    { category: 'wellness', text: 'Plan your week' },
  ],
  OVULATORY: [
    { category: 'movement', text: 'High intensity workout' },
    { category: 'wellness', text: 'Social activities' },
    { category: 'nutrition', text: 'Hydrate well' },
  ],
  LUTEAL: [
    { category: 'wellness', text: 'Turn inward, rest' },
    { category: 'nutrition', text: 'Complex carbs + magnesium' },
    { category: 'sleep', text: 'Sleep by 10pm' },
  ],
};

export default function Dashboard() {
  const { data: prediction, isLoading: predictionLoading } = usePredictions();
  const { data: insights, isLoading: insightsLoading } = useInsights();
  const { setPhase } = useTheme();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['cycles', 'stats'],
    queryFn: () => api.get('/cycles/stats').then((r) => r.data.data),
  });

  // Sync phase to ThemeContext → updates CSS custom properties
  useEffect(() => {
    if (prediction?.phase) {
      setPhase(prediction.phase as any);
    }
  }, [prediction?.phase, setPhase]);

  const phase = (prediction?.phase || 'FOLLICULAR') as keyof typeof PHASE_CONFIG;
  const phaseConfig = PHASE_CONFIG[phase];
  const recs = RECOMMENDATIONS[phase] || RECOMMENDATIONS.FOLLICULAR;
  const primaryInsight = insights?.[0];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[26px] font-semibold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left — Cycle Ring + Stats */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="flex items-center justify-center py-12 bg-gradient-to-b from-white to-lunara-whisper">
            <ProgressRing data={prediction} isLoading={predictionLoading} />
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="flex items-center gap-4">
              <div className="p-2.5 bg-lunara-mist rounded-lg">
                <Clock size={18} className="text-lunara-core" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Cycle</p>
                <p className="text-xl font-light font-mono text-slate-900">
                  {statsLoading ? '—' : `${stats?.averageCycleLength ?? '—'}d`}
                </p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="p-2.5 bg-lunara-mist rounded-lg">
                <Activity size={18} className="text-lunara-core" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Regularity</p>
                <p className="text-xl font-light font-mono text-slate-900">
                  {statsLoading ? '—' : stats?.regularityScore ? `${stats.regularityScore}%` : '—'}
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Right — Prediction + Insights */}
        <div className="lg:col-span-2 space-y-4">
          <NextPeriodCard data={prediction} />

          {insightsLoading
            ? <div className="h-20 rounded-premium-lg bg-lunara-mist animate-pulse" />
            : <InsightCard insight={primaryInsight} isLoading={insightsLoading} />
          }
        </div>
      </div>

      {/* Recommendations row */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {phaseConfig.label} Phase · Today's Recommendations
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          {recs.map((r) => (
            <RecommendationChip key={r.text} category={r.category} text={r.text} />
          ))}
        </div>
      </div>
    </div>
  );
}