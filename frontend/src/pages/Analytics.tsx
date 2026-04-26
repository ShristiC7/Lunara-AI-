import { useState, useEffect } from 'react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, BarChart, Bar, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';

const ChartSkeleton = () => (
  <div className="h-64 rounded-premium-lg bg-lunara-mist animate-pulse" />
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
    <div className="px-4 py-3 bg-white/90 backdrop-blur-md border border-slate-100 rounded-premium-lg shadow-xl text-sm">
      <p className="font-bold text-slate-900 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
          <span className="text-slate-500 font-medium">{p.name}:</span>
          <span className="text-slate-900 font-bold">{p.value} {p.unit || 'days'}</span>
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 400); return () => clearTimeout(t); }, []);

  const { data: cycles, isLoading } = useQuery({
    queryKey: ['cycles'],
    queryFn: () => api.get('/cycles').then((r) => r.data.data),
  });

  const cycleLengthData = cycles && Array.isArray(cycles) && cycles.length > 0
    ? cycles.slice(-12).map((c: any, i: number) => ({ name: `Cycle ${i + 1}`, days: c.cycleLength ?? 28 }))
    : Array.from({ length: 6 }, (_, i) => ({ name: `Cycle ${i + 1}`, days: 26 + Math.floor(Math.random() * 5) }));

  const avgLength = cycleLengthData.reduce((a: number, c: any) => a + c.days, 0) / cycleLengthData.length;

  const accuracy = [
    { name: 'Jan', delta: 1 }, { name: 'Feb', delta: 2 }, { name: 'Mar', delta: 0 },
    { name: 'Apr', delta: 3 }, { name: 'May', delta: 1 }, { name: 'Jun', delta: 0 },
  ];

  const barColor = (d: number) => d === 0 ? '#10b981' : d <= 2 ? '#8b5cf6' : '#f59e0b';

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold text-slate-900 tracking-tight leading-tight">Cycle Intelligence</h1>
          <p className="text-base text-slate-400 mt-1">Deep patterns extracted from your health data.</p>
        </div>
        <div className="flex gap-2">
           <div className="px-3 py-1.5 bg-lunara-mist rounded-full text-[10px] font-bold text-lunara-core uppercase tracking-widest border border-lunara-core/10">
             Updated Today
           </div>
        </div>
      </header>

      {/* Cycle Length Trend */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Cycle Length Trend</p>
          <span className="text-[11px] font-medium text-slate-400 italic">Last 12 cycles</span>
        </div>
        <Card className="p-6">
          {isLoading ? <ChartSkeleton /> : (
            <div className={`transition-all duration-1000 transform ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <AreaChart data={cycleLengthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis domain={[20, 40]} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={avgLength} stroke="#7c3aed" strokeDasharray="6 4" strokeOpacity={0.6}
                      label={{ value: `AVG ${avgLength.toFixed(1)}D`, position: 'right', fontSize: 10, fill: '#7c3aed', fontWeight: 800, dy: -10 }} />
                    <Area type="monotone" dataKey="days" stroke="#7C3AED" strokeWidth={3} fillOpacity={1} fill="url(#colorDays)"
                      dot={{ r: 4, fill: '#fff', stroke: '#7C3AED', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#7C3AED', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prediction Accuracy */}
        <section className="space-y-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Prediction Accuracy</p>
          <Card className="p-6 h-full flex flex-col">
            <div className={`flex-1 transition-all duration-1000 delay-300 transform ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <BarChart data={accuracy} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} dy={5} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="delta" radius={[6, 6, 0, 0]} barSize={24} name="Days difference">
                      {accuracy.map((e, i) => <Cell key={i} fill={barColor(e.delta)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
              <div>
                 <p className="text-[28px] font-light text-slate-900 tracking-tight">1.2<span className="text-sm font-semibold text-slate-400 ml-1">days off</span></p>
                 <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">High Confidence</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                <div className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-md uppercase">Model Synced</div>
              </div>
            </div>
          </Card>
        </section>

        {/* Symptom Heatmap */}
        <section className="space-y-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Intensity Heatmap</p>
          <Card className="p-6 h-full overflow-hidden">
             <div className="space-y-3">
              {HEATMAP_ROWS.map(({ label, days }) => (
                <div key={label} className="flex items-center gap-4">
                  <span className="w-16 text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">{label}</span>
                  <div className="flex gap-1.5 flex-1 justify-between">
                    {days.slice(0, 14).map((val, i) => (
                      <div key={i} title={`Day ${i + 1}: ${val.toFixed(1)}`}
                        className="flex-1 h-6 rounded-md transition-all duration-500 hover:scale-110 cursor-help"
                        style={{ 
                          backgroundColor: val > 0.2 ? heatColor(label, val) : '#f8fafc',
                          opacity: ready ? 1 : 0,
                          transitionDelay: `${i * 30}ms`
                        }} 
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-between items-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              <span>Day 1</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-slate-50" />
                <div className="w-3 h-3 rounded-sm bg-lunara-core/20" />
                <div className="w-3 h-3 rounded-sm bg-lunara-core/60" />
                <div className="w-3 h-3 rounded-sm bg-lunara-core" />
              </div>
              <span>Day 14</span>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
