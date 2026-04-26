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

  const content = insight?.content || "Log your symptoms today to receive a personalized health insight from Lunara AI.";

  return (
    <Card 
      className="relative overflow-hidden cursor-pointer group hover:border-[var(--phase-color)]/30 transition-all duration-200"
      onClick={() => setExpanded(!expanded)}
      noPadding
    >
      {/* Left accent border */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-lunara-core" />
      
      <div className="p-5 flex items-start gap-3">
        <div className="p-1.5 bg-lunara-mist rounded-md shrink-0">
          <Sparkles className="text-lunara-core" size={16} />
        </div>
        
        <div className="space-y-3 flex-1">
          <p className={`text-sm text-slate-700 leading-relaxed transition-all duration-200 ${expanded ? '' : 'line-clamp-2'}`}>
            {content}
          </p>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate('/insights');
            }}
            className="text-[11px] font-bold text-lunara-core uppercase tracking-wide hover:text-lunara-glow"
          >
            See all insights →
          </button>
        </div>
      </div>
    </Card>
  );
};
