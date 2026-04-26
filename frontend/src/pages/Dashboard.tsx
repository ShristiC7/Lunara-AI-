import React from 'react';
import { Card } from '../components/ui/Card';
import { CycleRing } from '../components/dashboard/CycleRing';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { usePredictions } from '../hooks/usePredictions';
import { useInsights } from '../hooks/useInsights';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  Clock, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  // Fetch Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await api.get('/cycles/stats');
      return res.data.data;
    }
  });

  const { data: prediction, isLoading: predictionLoading } = usePredictions();
  const { data: insights, isLoading: insightsLoading } = useInsights();

  const primaryInsight = insights?.[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">Your health overview for today.</p>
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-text-secondary bg-white px-4 py-2 rounded-full border border-border-premium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Cycle Status & Stats */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-white to-lavender/10">
            <CycleRing data={prediction} isLoading={predictionLoading} />
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="flex items-center gap-4 transition-transform hover:scale-[1.02]">
              <div className="p-3 bg-lavender rounded-xl text-accent-pink">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-tight">Avg Cycle</p>
                <p className="text-lg font-bold text-text-primary">
                  {statsLoading ? '...' : `${stats?.averageCycleLength || '--'} Days`}
                </p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 transition-transform hover:scale-[1.02]">
              <div className="p-3 bg-peach/30 rounded-xl text-accent-pink">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-tight">Regularity</p>
                <p className="text-lg font-bold text-text-primary">
                  {statsLoading ? '...' : (stats?.regularityScore ? `${stats.regularityScore}%` : '--')}
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Prediction & AI Insights */}
        <div className="space-y-6">
          
          <Card 
            variant={prediction?.daysUntil !== undefined && prediction.daysUntil <= 3 ? 'peach' : 'default'}
            className="relative overflow-hidden group cursor-default transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/50 rounded-lg">
                <Calendar className="text-accent-pink" size={20} />
              </div>
              <h3 className="font-bold text-text-primary">Next Period</h3>
            </div>
            {prediction ? (
              <div className="space-y-1">
                <p className="text-3xl font-black text-text-primary tracking-tight">
                  {new Date(prediction.predictedStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-sm font-medium text-text-secondary">
                  {prediction.daysUntil} days remaining
                </p>
                <div className="mt-6 pt-4 border-t border-black/5 flex justify-between items-center">
                  <span className="text-xs font-medium text-text-secondary">AI Confidence</span>
                  <span className="text-xs font-black text-accent-pink">{prediction.confidence}%</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary py-4">Predicting based on your logs...</p>
            )}
          </Card>

          <Card className="border-l-4 border-l-accent-pink shadow-lg hover:shadow-xl transition-shadow cursor-pointer group" onClick={() => navigate('/insights')}>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-accent-pink" size={20} />
              <h3 className="font-bold text-text-primary">Daily AI Insight</h3>
            </div>
            <p className="text-sm leading-relaxed text-text-secondary line-clamp-3">
              {primaryInsight?.content || "Log your symptoms today to receive a personalized health insight from Lunara AI."}
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-accent-pink uppercase tracking-wider group-hover:gap-2 transition-all">
              See All Insights <ChevronRight size={14} />
            </div>
          </Card>

          <button 
            onClick={() => navigate('/logger')}
            className="w-full py-5 bg-accent-pink text-white rounded-premium font-bold shadow-lg shadow-accent-pink/30 hover:shadow-accent-pink/40 hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Activity size={20} />
            Log Today's Symptoms
          </button>
        </div>

      </div>
    </div>
  );
}