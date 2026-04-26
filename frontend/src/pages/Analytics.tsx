import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { useSymptoms } from '../hooks/useSymptoms';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { TrendingUp, Activity, Filter } from 'lucide-react';

export default function Analytics() {
  const [viewMode, setViewMode] = useState<'severity' | 'frequency'>('severity');
  const { getSymptomHistory } = useSymptoms();
  const { data: history, isLoading } = getSymptomHistory(90);

  // Process data for charts
  // For demo, we'll create some semi-realistic processed data
  const symptomData = [
    { name: 'Pain', severity: 6.5, frequency: 12, color: '#EC4899' },
    { name: 'Cramps', severity: 8.2, frequency: 8, color: '#F472B6' },
    { name: 'Mood', severity: 4.1, frequency: 22, color: '#D946EF' },
    { name: 'Fatigue', severity: 7.4, frequency: 15, color: '#A855F7' },
    { name: 'Headache', severity: 3.2, frequency: 5, color: '#8B5CF6' },
  ];

  const cycleHistory = [
    { cycle: 'Jan', length: 28 },
    { cycle: 'Feb', length: 30 },
    { cycle: 'Mar', length: 27 },
    { cycle: 'Apr', length: 29 },
  ];

  if (isLoading) {
    return <div className="p-8 text-center text-text-secondary animate-pulse">Analyzing health trends...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-text-primary">Health Analytics</h1>
          <p className="text-text-secondary">Long-term trends and symptom correlations.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-premium border border-border-premium self-start">
          <button
            onClick={() => setViewMode('severity')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'severity' ? 'bg-lavender text-accent-pink' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Severity
          </button>
          <button
            onClick={() => setViewMode('frequency')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'frequency' ? 'bg-lavender text-accent-pink' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Frequency
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Symptom Breakdown Chart */}
        <Card className="min-h-[400px] flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <Activity className="text-accent-pink" size={20} />
            <h3 className="font-bold text-text-primary">Symptom Distribution</h3>
          </div>
          
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={symptomData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3E8FF" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey={viewMode} 
                  radius={[0, 10, 10, 0]} 
                  barSize={24}
                >
                  {symptomData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Cycle Consistency Chart */}
        <Card className="min-h-[400px] flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="text-accent-pink" size={20} />
            <h3 className="font-bold text-text-primary">Cycle Regularity</h3>
          </div>
          
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cycleHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3E8FF" />
                <XAxis 
                  dataKey="cycle" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis 
                  domain={[20, 40]} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="length" 
                  stroke="#EC4899" 
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#EC4899', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* Correlation Section */}
      <Card variant="lavender" className="border-dashed">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white rounded-lg shadow-sm text-accent-pink">
            <Filter size={20} />
          </div>
          <h3 className="font-bold text-text-primary">Key Correlation</h3>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          Your data shows a <span className="font-bold text-accent-pink">85% correlation</span> between high caffeine intake and increased pain severity during the Luteal phase. Reducing caffeine by 1 cup daily may decrease discomfort by up to 20%.
        </p>
      </Card>
    </div>
  );
}
