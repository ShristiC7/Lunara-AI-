import { useEffect } from 'react';
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
          <Card className="relative flex flex-col items-center justify-center py-10 bg-gradient-to-b from-white to-lunara-whisper overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--phase-color)]/5 blur-[80px] pointer-events-none" />
            
            <ProgressRing data={prediction} isLoading={predictionLoading} />
            
            {/* Cycle Forecast Bar */}
            <div className="mt-8 w-full max-w-md px-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">7-Day Forecast</span>
                <span className="text-[10px] font-medium text-slate-400">AI Predicted</span>
              </div>
              <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-slate-100">
                {Array.from({ length: 7 }).map((_, i) => {
                  const day = (prediction?.currentDay || 1) + i;
                  const dPhase = day <= 5 ? 'MENSTRUAL' : day <= 13 ? 'FOLLICULAR' : day <= 16 ? 'OVULATION' : 'LUTEAL';
                  const colors: any = { MENSTRUAL: '#f43f5e', FOLLICULAR: '#10b981', OVULATION: '#f59e0b', LUTEAL: '#7c3aed' };
                  return (
                    <div 
                      key={i} 
                      className="flex-1 transition-all duration-500" 
                      style={{ backgroundColor: colors[dPhase], opacity: 0.3 + (i * 0.1) }} 
                      title={`Day ${day}: ${dPhase}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-1 text-[9px] font-bold text-slate-400 uppercase">
                <span>Today</span>
                <span>Next Week</span>
              </div>
            </div>
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