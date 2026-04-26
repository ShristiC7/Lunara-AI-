import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { MoodStep } from './MoodStep';
import { BodyStep } from './BodyStep';
import { ExtrasStep } from './ExtrasStep';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

interface LoggerModalProps {
  onClose: () => void;
}

export const LoggerModal: React.FC<LoggerModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    mood: 0,
    energy: 0,
    painLevel: 0,
    sleepQuality: '',
    sleepHours: 7,
    stressLevel: 0,
    notes: '',
    flowIntensity: '',
  });

  const queryClient = useQueryClient();
  const { mutate: logSymptoms, isPending } = useMutation({
    mutationFn: (data: typeof formData) => api.post('/symptoms', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptoms'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      setConfirmed(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    },
  });

  if (confirmed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md">
        <div className="flex flex-col items-center gap-5 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 rounded-full bg-lunara-core flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.3)]">
            <CheckCircle className="text-white" size={48} strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-slate-900 tracking-tight">Sync Complete</p>
            <p className="text-sm text-slate-400 font-medium">Your health insights are updating...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-lg bg-white md:rounded-premium-2xl rounded-t-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-4 duration-500">
        
        {/* Syncing Overlay */}
        {isPending && (
          <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4">
             <div className="w-12 h-12 border-[3.5px] border-lunara-core border-t-transparent rounded-full animate-spin" />
             <p className="text-xs font-bold text-lunara-core uppercase tracking-[0.2em] animate-pulse">Syncing to Lunara AI</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="h-1.5 bg-slate-100">
          <div
            className="h-full bg-lunara-core transition-all duration-500 ease-out shadow-[0_0_8px_rgba(124,58,237,0.4)]"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Observation Flow · Step {step}</p>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {step === 1 ? 'Current State' : step === 2 ? 'Body Signals' : 'Contextual Extras'}
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close logger" className="p-2.5 rounded-full hover:bg-slate-50 text-slate-400 transition-colors">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Steps with internal animation */}
        <div className="px-8 py-8 min-h-[320px]">
          <div key={step} className="animate-in fade-in slide-in-from-right-4 duration-300">
            {step === 1 && <MoodStep data={formData} setData={setFormData} />}
            {step === 2 && <BodyStep data={formData} setData={setFormData} />}
            {step === 3 && <ExtrasStep data={formData} setData={setFormData} />}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 px-8 pb-10">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3.5 text-sm font-bold text-slate-400 bg-slate-50 rounded-premium-xl hover:bg-slate-100 transition-all active:scale-95"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && (formData.mood === 0 || formData.energy === 0)}
              className="flex-1 py-3.5 bg-lunara-core text-white font-bold text-sm rounded-premium-xl disabled:opacity-40 hover:bg-lunara-glow transition-all active:scale-95 shadow-lg shadow-lunara-core/20"
            >
              Next Step →
            </button>
          ) : (
            <button
              onClick={() => logSymptoms(formData)}
              disabled={isPending}
              className="flex-1 py-3.5 bg-lunara-core text-white font-bold text-sm rounded-premium-xl hover:bg-lunara-glow transition-all active:scale-95 shadow-lg shadow-lunara-core/20 flex items-center justify-center gap-2"
            >
              Finalize Sync ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
