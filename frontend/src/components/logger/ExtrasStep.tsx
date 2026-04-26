import React from 'react';

interface ExtrasStepProps {
  data: any;
  setData: (d: any) => void;
}

export const ExtrasStep: React.FC<ExtrasStepProps> = ({ data, setData }) => {
  const FLOW = ['None', 'Light', 'Medium', 'Heavy'];

  return (
    <div className="space-y-8">
      {/* Stress - 5 dot scale */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stress Level</label>
        <div className="flex gap-3 items-center">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setData({ ...data, stressLevel: v })}
              className={`w-10 h-10 rounded-full border-2 transition-all duration-150 font-bold text-sm ${
                data.stressLevel >= v
                  ? 'bg-lunara-core border-lunara-core text-white'
                  : 'bg-white border-border-default text-slate-300 hover:border-lunara-core/30'
              }`}
            >
              {v}
            </button>
          ))}
          <span className="ml-2 text-xs font-semibold text-slate-400">
            {data.stressLevel === 0 ? 'Tap to rate' : data.stressLevel <= 2 ? 'Low' : data.stressLevel <= 4 ? 'Moderate' : 'High'}
          </span>
        </div>
      </div>

      {/* Flow */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Flow (if applicable)</label>
        <div className="grid grid-cols-4 gap-2">
          {FLOW.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setData({ ...data, flowIntensity: f === 'None' ? '' : f })}
              className={`py-2.5 text-xs font-semibold rounded-premium-md border transition-all duration-150 ${
                (data.flowIntensity || 'None') === f
                  ? 'bg-phase-menstrual/80 border-phase-menstrual text-white'
                  : 'bg-white border-border-default text-slate-600 hover:border-phase-menstrual/30'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Notes</label>
        <input
          type="text"
          maxLength={200}
          value={data.notes}
          onChange={(e) => setData({ ...data, notes: e.target.value })}
          placeholder="Anything to add? (optional)"
          className="w-full px-4 py-3 bg-surface-sunken text-sm rounded-premium-md border border-transparent focus:outline-none focus:border-lunara-core/30 focus:bg-white transition-all placeholder:text-slate-400"
        />
      </div>
    </div>
  );
};
