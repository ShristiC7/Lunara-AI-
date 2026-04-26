import React from 'react';

const MOODS = [
  { value: 5, label: 'Radiant', emoji: '☀️' },
  { value: 4, label: 'Good', emoji: '🙂' },
  { value: 3, label: 'Neutral', emoji: '😐' },
  { value: 2, label: 'Meh', emoji: '😕' },
  { value: 1, label: 'Low', emoji: '😔' },
  { value: 0.5, label: 'Rough', emoji: '😞' },
];

const ENERGY = [
  { value: 5, label: 'Peak' },
  { value: 4, label: 'High' },
  { value: 3, label: 'Medium' },
  { value: 2, label: 'Low' },
  { value: 1, label: 'Drained' },
];

interface MoodStepProps {
  data: any;
  setData: (d: any) => void;
}

export const MoodStep: React.FC<MoodStepProps> = ({ data, setData }) => {
  return (
    <div className="space-y-8">
      {/* Mood Row */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mood</label>
        <div className="grid grid-cols-3 gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setData({ ...data, mood: m.value })}
              className={`py-3 flex flex-col items-center gap-1 rounded-premium-md border transition-all duration-150 ${
                data.mood === m.value
                  ? 'bg-lunara-core border-lunara-core text-white shadow-sm'
                  : 'bg-white border-border-default text-slate-600 hover:border-lunara-core/30'
              }`}
            >
              <span className="text-lg">{m.emoji}</span>
              <span className="text-[11px] font-semibold">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Energy Row */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Energy</label>
        <div className="flex gap-2">
          {ENERGY.map((e) => (
            <button
              key={e.value}
              type="button"
              onClick={() => setData({ ...data, energy: e.value })}
              className={`flex-1 py-3 text-xs font-semibold rounded-premium-md border transition-all duration-150 ${
                data.energy === e.value
                  ? 'bg-lunara-core border-lunara-core text-white shadow-sm'
                  : 'bg-white border-border-default text-slate-600 hover:border-lunara-core/30'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
