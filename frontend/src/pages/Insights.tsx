import React from 'react';
import { Card } from '../components/ui/Card';
import { useInsights } from '../hooks/useInsights';
import { Sparkles, ArrowRight, BrainCircuit, Heart, Info } from 'lucide-react';

export default function Insights() {
  const { data: insights, isLoading } = useInsights();

  const getIcon = (category: string) => {
    switch (category) {
      case 'SYMPTOM': return Heart;
      case 'WELLNESS': return BrainCircuit;
      case 'CYCLE': return Sparkles;
      default: return Info;
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-text-secondary animate-pulse">Generating your personalized health insights...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-text-primary">AI Insights</h1>
        <p className="text-text-secondary">Personalized health patterns detected by Lunara AI.</p>
      </header>

      {insights && insights.length > 0 ? (
        <div className="grid gap-4">
          {insights.map((insight) => {
            const Icon = getIcon(insight.category);
            return (
              <Card 
                key={insight.id} 
                className="flex items-start gap-6 hover:border-accent-pink transition-all group"
              >
                <div className={`p-4 rounded-premium ${
                  insight.category === 'SYMPTOM' ? 'bg-peach/30 text-accent-pink' :
                  insight.category === 'WELLNESS' ? 'bg-lavender text-accent-pink' :
                  'bg-background text-text-secondary'
                }`}>
                  <Icon size={24} />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60">
                      {insight.category} • {new Date(insight.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-text-primary leading-relaxed">
                    {insight.content}
                  </p>
                  <button className="flex items-center gap-1 text-sm font-bold text-accent-pink hover:gap-2 transition-all opacity-0 group-hover:opacity-100">
                    Learn more about this pattern <ArrowRight size={16} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-premium border-2 border-dashed border-border-premium">
          <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 text-text-secondary">
            <Sparkles size={32} />
          </div>
          <h3 className="text-xl font-bold text-text-primary">No insights yet</h3>
          <p className="text-text-secondary mt-2 max-w-sm mx-auto">
            Log your symptoms for 2-3 more days to allow our AI to detect patterns in your health.
          </p>
        </div>
      )}

      {/* Trust Footer */}
      <div className="bg-white/50 p-6 rounded-premium border border-border-premium flex items-center gap-4">
        <div className="w-10 h-10 bg-accent-pink/10 rounded-full flex items-center justify-center text-accent-pink shrink-0">
          <BrainCircuit size={20} />
        </div>
        <p className="text-xs text-text-secondary">
          Insights are generated using hybrid AI models based strictly on your local logs. Your data never leaves Lunara's encrypted environment for third-party training.
        </p>
      </div>
    </div>
  );
}
