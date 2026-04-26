import React from 'react';

const SLEEP_QUALITY = ['Poor', 'Fair', 'Good', 'Great'];

interface BodyStepProps {
  data: any;
  setData: (d: any) => void;
}

export const BodyStep: React.FC<BodyStepProps> = ({ data, setData }) => {
  const painColor =
    data.painLevel <= 3
      ? 'bg-emerald-500'
      : data.painLevel <= 6
      ? 'bg-phase-luteal'
      : 'bg-phase-menstrual/70';

  return (
    <div className="space-y-8">
      {/* Pain Slider */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pain / Discomfort</label>
          <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded-md text-white ${painColor}`}>
            {data.painLevel} / 10
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          value={data.painLevel}
          onChange={(e) => setData({ ...data, painLevel: parseInt(e.target.value) })}
          className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-lunara-core"
        />
        <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          <span>None</span>
          <span>Severe</span>
        </div>
      </div>

      {/* Sleep Quality */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sleep Quality</label>
        <div className="grid grid-cols-4 gap-2">
          {SLEEP_QUALITY.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setData({ ...data, sleepQuality: q })}
              className={`py-2.5 text-xs font-semibold rounded-premium-md border transition-all duration-150 ${
                data.sleepQuality === q
                  ? 'bg-lunara-core border-lunara-core text-white'
                  : 'bg-white border-border-default text-slate-600 hover:border-lunara-core/30'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Sleep Hours Stepper */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sleep Hours</label>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setData({ ...data, sleepHours: Math.max(3, data.sleepHours - 0.5) })}
            className="w-10 h-10 rounded-full border border-border-default flex items-center justify-center text-slate-600 font-bold hover:bg-surface-hover text-xl"
          >
            −
          </button>
          <span className="flex-1 text-center font-mono text-2xl font-light text-slate-900">
            {data.sleepHours}h
          </span>
          <button
            type="button"
            onClick={() => setData({ ...data, sleepHours: Math.min(14, data.sleepHours + 0.5) })}
            className="w-10 h-10 rounded-full border border-border-default flex items-center justify-center text-slate-600 font-bold hover:bg-surface-hover text-xl"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
