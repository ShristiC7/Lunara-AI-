import React, { useEffect, useState } from 'react';
import { PredictionData } from '../../hooks/usePredictions';
import { PHASE_CONFIG } from '../../utils/phase.utils';

interface ProgressRingProps {
  data?: PredictionData | null;
  isLoading?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ data, isLoading }) => {
  const size = 280;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const [offset, setOffset] = useState(circumference);
  
  const cycleDay = data?.cycleDay || 0;
  const phase = data?.phase || 'FOLLICULAR';
  const config = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG];

  useEffect(() => {
    if (!isLoading) {
      // Logic for progress percentage (day/28 for now, but should use predicted length)
      const predictedLength = data?.predictedLength || 28;
      const progress = Math.min(100, (cycleDay / predictedLength) * 100);
      const targetOffset = circumference - (progress / 100) * circumference;
      
      const timer = setTimeout(() => {
        setOffset(targetOffset);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [cycleDay, isLoading, circumference, data?.predictedLength]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center animate-pulse">
        <div className="w-[280px] h-[280px] rounded-full bg-lunara-mist/50 border-[14px] border-lunara-mist" />
        <div className="h-8 w-32 bg-lunara-mist/50 mt-8 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG Ring */}
        <svg className="transform -rotate-90 w-full h-full drop-shadow-sm">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-100"
          />
          {/* Phase Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--phase-color)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-[1000ms] ease-out"
            style={{ 
              filter: 'drop-shadow(0 0 8px var(--phase-color))',
              opacity: 0.8
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Day</span>
          <span className="text-[64px] font-black text-slate-900 leading-none">
            {cycleDay || '--'}
          </span>
          <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-white shadow-sm border border-border-default rounded-full">
             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config?.color }} />
             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
               {config?.label}
             </span>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center max-w-[240px] animate-in fade-in slide-in-from-bottom-2 duration-700">
        <p className="text-sm font-medium text-slate-500 leading-relaxed">
          {config?.description}
        </p>
      </div>
    </div>
  );
};
