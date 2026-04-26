import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, BarChart, Bar, Cell,
} from 'recharts';
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 bg-white border border-border-default rounded-premium-md shadow-sm text-xs font-semibold text-slate-700">
      {label}: {payload[0].value} days
    </div>
  );
};

export default function Analytics() {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);

  const { data: cycles, isLoading } = useQuery({
    queryKey: ['cycles'],
    queryFn: () => api.get('/cycles').then((r) => r.data.data),
  });

  const cycleLengthData = cycles
    ? cycles.slice(-12).map((c: any, i: number) => ({ name: `C${i + 1}`, days: c.cycleLength ?? 28 }))
    : Array.from({ length: 6 }, (_, i) => ({ name: `C${i + 1}`, days: 28 }));

  const avgLength = cycleLengthData.reduce((a: number, c: any) => a + c.days, 0) / cycleLengthData.length;

  const accuracy = [
    { name: 'C1', delta: 1 }, { name: 'C2', delta: 3 }, { name: 'C3', delta: 0 },
    { name: 'C4', delta: 5 }, { name: 'C5', delta: 2 }, { name: 'C6', delta: 1 },
  ];

  const barColor = (d: number) => d <= 2 ? '#10b981' : d <= 5 ? '#f59e0b' : '#f43f5e88';

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-[26px] font-semibold text-slate-900 tracking-tight">Analytics</h1>
        <p className="text-sm text-slate-400 mt-0.5">Only charts that reveal something actionable.</p>
      </header>

      <section className="space-y-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cycle Length Trend</p>
        <Card>
          {isLoading ? <ChartSkeleton /> : (
            <div className={`transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={cycleLengthData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[20, 40]} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={avgLength} stroke="#7c3aed" strokeDasharray="4 4" strokeOpacity={0.4}
                    label={{ value: `avg ${avgLength.toFixed(0)}d`, position: 'right', fontSize: 10, fill: '#7c3aed', fontWeight: 700 }} />
                  <Line type="monotone" dataKey="days" stroke="#7C3AED" strokeWidth={2}
                    dot={{ r: 5, fill: '#7C3AED', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
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
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Prediction Accuracy — Days Off</p>
        <Card>
          <div className={`transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={accuracy} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={2} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.5} />
                <Bar dataKey="delta" radius={[4, 4, 0, 0]}>
                  {accuracy.map((e, i) => <Cell key={i} fill={barColor(e.delta)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-center font-mono text-[22px] font-light text-slate-900">
            1.8 <span className="text-sm font-semibold text-slate-400">days average accuracy</span>
          </p>
        </Card>
      </section>
    </div>
  );
}
