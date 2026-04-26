import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSymptoms } from '../hooks/useSymptoms';
import { 
  Smile, 
  Frown, 
  Meh, 
  Zap, 
  Battery, 
  BatteryLow,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const MOODS = [
  { id: 'happy', label: 'Happy', icon: Smile },
  { id: 'calm', label: 'Calm', icon: Meh },
  { id: 'anxious', label: 'Anxious', icon: Zap },
  { id: 'sad', label: 'Sad', icon: Frown },
  { id: 'irritated', label: 'Irritated', icon: AlertCircle },
];

const FLOW_LEVELS = ['None', 'Light', 'Medium', 'Heavy', 'Super'];

export default function Logger() {
  const navigate = useNavigate();
  const { logSymptom } = useSymptoms();
  
  const [mood, setMood] = useState<string[]>([]);
  const [pain, setPain] = useState(0);
  const [energy, setEnergy] = useState(5);
  const [flow, setFlow] = useState('None');
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleMood = (id: string) => {
    setMood(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    try {
      await logSymptom.mutateAsync({
        mood,
        pain,
        energy,
        flow: flow !== 'None' ? flow : undefined
      });
      setIsSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  if (isSuccess) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-soft-pink rounded-full flex items-center justify-center text-accent-pink mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-black text-text-primary">Logged!</h1>
        <p className="text-text-secondary mt-2">Your insights are being updated...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-text-primary">Daily Log</h1>
        <p className="text-text-secondary">How are you feeling today?</p>
      </header>

      {/* Mood Selection */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest px-1">Mood</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => toggleMood(m.id)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-premium border-2 transition-all
                ${mood.includes(m.id) 
                  ? 'border-accent-pink bg-lavender text-accent-pink shadow-md' 
                  : 'border-border-premium bg-white text-text-secondary hover:border-lavender'
                }
              `}
            >
              <m.icon size={24} />
              <span className="text-xs font-bold">{m.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Energy Slider */}
      <Card className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Energy Level</h3>
          <span className="text-lg font-black text-accent-pink">{energy}/10</span>
        </div>
        <div className="flex items-center gap-4">
          <BatteryLow className="text-text-secondary" size={20} />
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={energy} 
            onChange={(e) => setEnergy(parseInt(e.target.value))}
            className="flex-1 accent-accent-pink"
          />
          <Zap className="text-accent-pink" size={20} />
        </div>
      </Card>

      {/* Pain Level */}
      <Card className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Pain / Discomfort</h3>
          <span className="text-lg font-black text-accent-pink">{pain}/10</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="10" 
          value={pain} 
          onChange={(e) => setPain(parseInt(e.target.value))}
          className="w-full accent-accent-pink"
        />
        <div className="flex justify-between text-[10px] text-text-secondary font-bold uppercase tracking-tighter">
          <span>None</span>
          <span>Moderate</span>
          <span>Severe</span>
        </div>
      </Card>

      {/* Flow Selection */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest px-1">Period Flow</h3>
        <div className="flex flex-wrap gap-2">
          {FLOW_LEVELS.map((f) => (
            <button
              key={f}
              onClick={() => setFlow(f)}
              className={`
                px-6 py-3 rounded-button border-2 font-bold text-sm transition-all
                ${flow === f 
                  ? 'bg-accent-pink border-accent-pink text-white shadow-lg' 
                  : 'bg-white border-border-premium text-text-secondary hover:border-lavender'
                }
              `}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <div className="pt-4">
        <Button 
          className="w-full py-6 text-xl shadow-xl shadow-accent-pink/20" 
          onClick={handleSubmit}
          isLoading={logSymptom.isPending}
        >
          Complete Daily Log
        </Button>
      </div>
    </div>
  );
}
