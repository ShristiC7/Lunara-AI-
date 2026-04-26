import React, { useState, useEffect } from 'react';
// import {
//   LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
//   ReferenceLine, BarChart, Bar, Cell,
// } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';

const ChartSkeleton = () => (
  <div className="h-48 rounded-premium-lg bg-lunara-mist animate-pulse" />
);

const HEATMAP_ROWS = [
  { label: 'Mood', days: Array.from({ length: 30 }, () => Math.random() * 5) },
  { label: 'Pain', days: Array.from({ length: 30 }, () => Math.random() * 10) },
  { label: 'Energy', days: Array.from({ length: 30 }, () => Math.random() * 5) },
  { label: 'Sleep', days: Array.from({ length: 30 }, () => Math.random() * 5) },
  { label: 'Stress', days: Array.from({ length: 30 }, () => Math.random() * 5) },
];

const heatColor = (label: string, val: number) => {
  const op = Math.min(1, val / 5);
  if (label === 'Pain') return `rgba(244,63,94,${Math.min(1, val / 10)})`;
  if (label === 'Stress') return `rgba(245,158,11,${op})`;
  return `rgba(124,58,237,${op})`;
};

export default function Analytics() {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);

  const { data: cycles, isLoading } = useQuery({
    queryKey: ['cycles'],
    queryFn: () => api.get('/cycles').then((r) => r.data.data),
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-[26px] font-semibold text-slate-900 tracking-tight">Analytics</h1>
        <p className="text-sm text-slate-400 mt-0.5">Only charts that reveal something actionable.</p>
      </header>

      <section className="space-y-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cycle Length Trend</p>
        <Card>
          <div className="h-48 flex items-center justify-center text-slate-400 italic">
            Cycle length trends will appear here as you log more data.
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Symptom Heatmap — Last 30 Days</p>
        <Card className="overflow-x-auto">
          <div className="min-w-[480px] space-y-2">
            {HEATMAP_ROWS.map(({ label, days }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-14 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">{label}</span>
                <div className="flex gap-1">
                  {days.map((val, i) => (
                    <div key={i} title={`Day ${i + 1}: ${val.toFixed(1)}`}
                      className="w-5 h-5 rounded-sm border border-slate-100"
                      style={{ backgroundColor: val > 0.2 ? heatColor(label, val) : '#f8f8fb' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Prediction Accuracy</p>
        <Card>
          <div className="h-32 flex items-center justify-center text-slate-400 italic">
            Accuracy tracking starts after your second logged cycle.
          </div>
        </Card>
      </section>
    </div>
  );
}
