import React from 'react';
import { Utensils, Footprints, Moon, Heart } from 'lucide-react';

interface RecommendationChipProps {
  category: 'nutrition' | 'movement' | 'sleep' | 'wellness';
  text: string;
}

const icons = {
  nutrition: Utensils,
  movement: Footprints,
  sleep: Moon,
  wellness: Heart,
};

export const RecommendationChip: React.FC<RecommendationChipProps> = ({ category, text }) => {
  const Icon = icons[category];
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border-default rounded-premium-2xl shrink-0 hover:border-[var(--phase-color)]/40 transition-colors cursor-default group">
      <Icon size={14} strokeWidth={1.5} className="text-[var(--phase-color)] transition-transform group-hover:scale-110" />
      <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">{text}</span>
    </div>
  );
};
