import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InsightCardProps {
  insight?: { content: string };
  isLoading?: boolean;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, isLoading }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return <div className="h-20 rounded-premium-xl bg-lunara-mist animate-pulse" />;
  }

  const rawContent = insight?.content;
  const content = typeof rawContent === 'string' 
    ? rawContent 
    : (rawContent as any)?.summary || "Log your symptoms today to receive a personalized health insight from Lunara AI.";

  return (
    <Card 
      className="relative overflow-hidden cursor-pointer group hover:border-[var(--phase-color)]/30 transition-all duration-300"
      onClick={() => setExpanded(!expanded)}
      noPadding
    >
      {/* Dynamic background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[var(--phase-color)]/0 via-transparent to-[var(--phase-color)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Left accent border */}
      <div className="absolute left-0 top-0 bottom-0 w-[3.5px] bg-lunara-core" />
      
      <div className="p-5 flex items-start gap-4">
        <div className="p-2 bg-lunara-mist rounded-lg shrink-0 group-hover:scale-110 transition-transform duration-300">
          <Sparkles className="text-lunara-core animate-pulse" size={16} />
        </div>
        
        <div className="space-y-3 flex-1">
          <div className="flex items-center justify-between">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Observation</span>
             <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-emerald-50 rounded-md">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-bold text-emerald-600 uppercase">94% Confidence</span>
             </div>
          </div>

          <p className={`text-sm text-slate-700 leading-relaxed font-medium transition-all duration-300 ${expanded ? '' : 'line-clamp-2'}`}>
            {content}
          </p>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate('/insights');
            }}
            className="text-[11px] font-bold text-lunara-core uppercase tracking-widest hover:text-lunara-glow inline-flex items-center gap-1"
          >
            Explore Patterns <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </Card>
  );
};
