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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 animate-confirm">
          <div className="w-20 h-20 rounded-full bg-lunara-core flex items-center justify-center">
            <CheckCircle className="text-white" size={40} />
          </div>
          <p className="text-xl font-bold text-slate-900">Logged for today</p>
          <p className="text-sm text-slate-500">Your data has been saved securely.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-lg bg-white md:rounded-premium-xl rounded-t-[28px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 duration-300">
        {/* Progress Bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-lunara-core transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step {step} of 3</p>
            <h3 className="text-base font-bold text-slate-900">
              {step === 1 ? 'How do you feel?' : step === 2 ? 'Body check' : 'Optional extras'}
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close logger" className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Steps */}
        <div className="px-6 py-6">
          {step === 1 && <MoodStep data={formData} setData={setFormData} />}
          {step === 2 && <BodyStep data={formData} setData={setFormData} />}
          {step === 3 && <ExtrasStep data={formData} setData={setFormData} />}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 px-6 pb-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-3 text-sm font-semibold text-slate-500 bg-slate-100 rounded-premium-md hover:bg-slate-200 transition-colors"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && (formData.mood === 0 || formData.energy === 0)}
              className="flex-1 py-3 bg-lunara-core text-white font-bold rounded-premium-md disabled:opacity-40 hover:bg-lunara-glow transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => logSymptoms(formData)}
              disabled={isPending}
              className="flex-1 py-3 bg-lunara-core text-white font-bold rounded-premium-md hover:bg-lunara-glow transition-colors flex items-center justify-center gap-2"
            >
              {isPending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              Log it ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
