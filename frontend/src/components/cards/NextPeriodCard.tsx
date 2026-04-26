import React from 'react';
import { Card } from '../ui/Card';
import { Calendar, Info } from 'lucide-react';
import { PredictionData } from '../../hooks/usePredictions';

interface NextPeriodCardProps {
  data?: PredictionData | null;
}

export const NextPeriodCard: React.FC<NextPeriodCardProps> = ({ data }) => {
  const isPeriodClose = data?.daysUntil !== undefined && data.daysUntil <= 3;
  
  return (
    <Card 
      variant="tinted" 
      className={`relative overflow-hidden group ${isPeriodClose ? 'animate-gentle-pulse' : ''}`}
    >
      {/* Dynamic Background Wash */}
      <div className="absolute inset-0 bg-[var(--phase-light)] opacity-30" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-border-default">
              <Calendar className="text-[var(--phase-color)]" size={18} />
            </div>
            <h3 className="font-bold text-slate-900">Next period expected</h3>
          </div>
          {data?.confidence && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-full border border-border-default">
              <span className="text-[10px] font-black text-[var(--phase-color)]">{data.confidence}%</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">confident</span>
            </div>
          )}
        </div>

        {data ? (
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-[28px] font-light font-mono text-slate-900 tracking-tighter">
                {new Date(data.predictedStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                <span className="mx-1 opacity-20">–</span>
                {new Date(new Date(data.predictedStartDate).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { day: 'numeric' })}
              </p>
              <p className="text-sm font-semibold text-[var(--phase-color)]">
                {data.daysUntil === 0 ? 'Starts today' : `In ${data.daysUntil} days`}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-4">
             <p className="text-sm text-slate-500 font-medium italic">Predicting based on your logs...</p>
          </div>
        )}

        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
           <Info size={12} />
           AI calculation updated today
        </div>
      </div>
    </Card>
  );
};
