import React from 'react';
import { PredictionData } from '../../hooks/usePredictions';

interface CycleRingProps {
  data?: PredictionData;
  isLoading?: boolean;
}

export const CycleRing: React.FC<CycleRingProps> = ({ data, isLoading }) => {
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Logic for progress percentage
  // If follicular: day/total follicular length...
  // For simplicity: cycleDay / averageCycleLength (default 28)
  const progress = data?.cycleDay ? (data.cycleDay / 28) * 100 : 0;
  const offset = circumference - (progress / 100) * circumference;

  const phaseLabels = {
    MENSTRUAL: 'Menstrual Phase',
    FOLLICULAR: 'Follicular Phase',
    OVULATORY: 'Ovulatory Phase',
    LUTEAL: 'Luteal Phase',
  };

  const phaseDescriptions = {
    MENSTRUAL: 'Time for rest and reflection.',
    FOLLICULAR: 'Energy levels are rising.',
    OVULATORY: 'Peak energy and confidence.',
    LUTEAL: 'PMS symptoms may occur.',
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center animate-pulse">
        <div className="w-48 h-48 rounded-full bg-lavender/50"></div>
        <div className="h-6 w-32 bg-lavender/50 mt-6 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Circle */}
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-lavender"
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-accent-pink transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-accent-pink uppercase tracking-widest">Day</span>
          <span className="text-5xl font-black text-text-primary leading-none">
            {data?.cycleDay || '--'}
          </span>
        </div>
      </div>

      <div className="mt-8 text-center px-4">
        <h3 className="text-2xl font-bold text-text-primary">
          {data?.phase ? phaseLabels[data.phase] : 'No Data'}
        </h3>
        <p className="text-text-secondary mt-2 max-w-xs mx-auto">
          {data?.phase ? phaseDescriptions[data.phase] : 'Start logging your cycle to see predictions.'}
        </p>
      </div>
    </div>
  );
};
