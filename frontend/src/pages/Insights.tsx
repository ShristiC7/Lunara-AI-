import React from 'react';
import { useInsights } from '../hooks/useInsights';
import { Card } from '../components/ui/Card';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { PHASE_CONFIG } from '../utils/phase.utils';

const PHASE_TIPS: Record<string, string[]> = {
  MENSTRUAL: ['Rest is productive. Schedule lighter tasks.', 'Warm foods and gentle hydration.'],
  FOLLICULAR: ['Start new projects — your brain is primed for it.', 'Experiment with workouts: try something new.'],
  OVULATION: ['Your communication peaks now — ideal for interviews or meetings.', 'High-intensity exercise yields best results.'],
  LUTEAL: ['Avoid caffeine in the second half of luteal.', 'Journaling helps process pre-menstrual emotions.'],
};

export default function Insights() {
  const { data: insights, isLoading } = useInsights();

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-[26px] font-semibold text-slate-900 tracking-tight">AI Insights</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Based on {insights?.length || 0} logged data point{insights?.length !== 1 ? 's' : ''}
        </p>
      </header>

      {/* Insight Cards */}
      <section className="space-y-3">
        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">What your data shows</h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-premium-lg bg-lunara-mist animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        ) : insights && insights.length > 0 ? (
          <div className="space-y-3">
            {insights.slice(0, 3).map((insight: any, i: number) => (
              <Card
                key={insight.id}
                className="relative overflow-hidden group hover:border-lunara-core/20 transition-all"
                style={{ animationDelay: `${i * 60}ms` } as React.CSSProperties}
              >
                <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: 'var(--phase-color)' }} />
                <div className="pl-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--phase-color)' }} />
                    <p className="text-sm text-slate-700 leading-relaxed max-w-[60ch]">
                      {typeof insight.content === 'string' ? insight.content : insight.content?.summary}
                    </p>
                  </div>
                  {/* Evidence bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      <span>Pattern strength</span>
                      <span>82% of cycles</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-lunara-core rounded-full" style={{ width: '82%' }} />
                    </div>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400">
                    {new Date(insight.createdAt || insight.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="sunken" className="flex flex-col items-center text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-full bg-lunara-mist flex items-center justify-center">
              <Sparkles className="text-lunara-core" size={22} strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-slate-900">No insights yet</h3>
            <p className="text-sm text-slate-500 max-w-xs">
              Log your symptoms for 2–3 more days to allow the AI to detect patterns in your health.
            </p>
          </Card>
        )}
      </section>

      {/* Phase Guide */}
      <section className="space-y-3">
        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Phase Guide</h2>
        <div className="space-y-2">
          {Object.entries(PHASE_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <details key={key} className="group">
                <summary className="flex items-center gap-3 px-5 py-4 bg-white border border-border-default rounded-premium-lg cursor-pointer hover:border-border-emphasis transition-colors list-none">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: config.color }} />
                  <Icon size={16} strokeWidth={1.5} className="text-slate-500" />
                  <span className="text-sm font-semibold text-slate-800">{config.label} Phase</span>
                  <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-wider">Days {config.dayRange[0]}–{config.dayRange[1]}</span>
                </summary>
                <div className="px-5 py-4 bg-surface-sunken border border-t-0 border-border-default rounded-b-premium-lg -mt-1">
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">{config.description}</p>
                  <ul className="space-y-2">
                    {(PHASE_TIPS[key] || []).map((tip) => (
                      <li key={tip} className="text-xs text-slate-500 flex items-start gap-2">
                        <span className="text-lunara-core mt-0.5">•</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            );
          })}
        </div>
      </section>

      {/* Irregularity placeholder */}
      <section>
        <div className="flex items-start gap-4 p-5 bg-amber-50 border border-amber-200/60 rounded-premium-lg">
          <AlertTriangle size={18} strokeWidth={1.5} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-amber-900">Cycle longer than usual</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Your last cycle was 9 days longer than your average. This can be normal, but it may be worth mentioning to your doctor.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy badge */}
      <footer className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-4">
        <span>🔒</span> Encrypted &amp; private — insights generated only from your data
      </footer>
    </div>
  );
}
