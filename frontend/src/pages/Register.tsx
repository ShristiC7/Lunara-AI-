import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { Moon, Shield, ChevronRight, ChevronLeft } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    ageRange: '',
    cycleLength: '28',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      nextStep();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/register', { 
        email: formData.email, 
        password: formData.password 
      });
      setAuth(res.data.data.user, res.data.data.accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed.');
      setStep(1); // Go back to fix
    } finally {
      setIsLoading(false);
    }
  };

  const ageRanges = ['13-17', '18-24', '25-34', '35-44', '45+'];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-bg">
      {/* Left Panel - Same as Login */}
      <div className="hidden md:flex md:w-[45%] bg-lunara-midnight p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 flex items-center justify-center">
          <div className="w-[600px] h-[600px] border border-lunara-bloom/30 rounded-full animate-[spin_120s_linear_infinite]" />
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <Moon className="text-lunara-core" size={24} fill="currentColor" />
          <span className="text-xl font-bold text-white tracking-tight">Lunara AI</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight">Start your journey to<br />body intelligence.</h2>
        </div>
      </div>

      {/* Right Panel - Multi-step Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Progress Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-border-default overflow-hidden">
          <div 
            className="h-full bg-lunara-core transition-all duration-300" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="w-full max-w-md space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <header className="space-y-2">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create account</h1>
                  <p className="text-slate-500">Secure your health data with a private account.</p>
                </header>
                <div className="space-y-4">
                  <Input 
                    label="Email Address" 
                    type="email" 
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <div className="space-y-2">
                    <Input 
                      label="Password" 
                      type="password" 
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`flex-1 rounded-full ${formData.password.length > i * 2 ? 'bg-lunara-core' : 'bg-border-default'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <Button type="submit" size="md" className="w-full">
                  Continue <ChevronRight size={18} />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <button type="button" onClick={prevStep} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-semibold">
                  <ChevronLeft size={16} /> Back
                </button>
                <header className="space-y-2">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">A little about you</h1>
                  <p className="text-slate-500">This helps our AI personalize your predictions.</p>
                </header>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-500 tracking-tight uppercase px-1">Age Range</label>
                    <div className="grid grid-cols-3 gap-2">
                      {ageRanges.map((range) => (
                        <button
                          key={range}
                          type="button"
                          onClick={() => setFormData({ ...formData, ageRange: range })}
                          className={`py-2 text-sm font-semibold rounded-premium-md border transition-all ${
                            formData.ageRange === range 
                              ? 'bg-lunara-core border-lunara-core text-white shadow-sm' 
                              : 'bg-white border-border-default text-slate-600 hover:border-lunara-core/30'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-500 tracking-tight uppercase px-1">Average Cycle Length (Days)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" min="21" max="45" 
                        value={formData.cycleLength}
                        onChange={(e) => setFormData({ ...formData, cycleLength: e.target.value })}
                        className="flex-1 accent-lunara-core h-1 bg-border-default rounded-full appearance-none cursor-pointer"
                      />
                      <span className="w-12 text-center font-mono font-bold text-lunara-core bg-lunara-mist py-1 rounded-md">
                        {formData.cycleLength}
                      </span>
                    </div>
                  </div>
                </div>
                <Button type="submit" size="md" className="w-full">
                  Continue <ChevronRight size={18} />
                </Button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <button type="button" onClick={prevStep} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-semibold">
                  <ChevronLeft size={16} /> Back
                </button>
                <header className="space-y-2">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Privacy & Trust</h1>
                  <p className="text-slate-500">Your health data is a sanctuary. We keep it that way.</p>
                </header>
                <div className="p-6 bg-lunara-mist/50 rounded-premium-lg border border-lunara-core/10 space-y-4">
                  <div className="flex gap-4">
                    <Shield className="text-lunara-core shrink-0" size={24} />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">End-to-End Encryption</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">Even we can't see your symptom logs. Your data is decrypted only on your device.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Moon className="text-lunara-core shrink-0" size={24} />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">No Third-party Sharing</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">We never sell your health data to advertisers or insurance companies. Period.</p>
                    </div>
                  </div>
                </div>
                {error && (
                  <div className="p-3 bg-phase-menstrual/10 border border-phase-menstrual/20 rounded-premium-md text-xs text-phase-menstrual font-medium text-center">
                    {error}
                  </div>
                )}
                <Button type="submit" size="md" className="w-full" isLoading={isLoading}>
                  Create My Account
                </Button>
              </div>
            )}
          </form>

          <footer className="pt-8 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-lunara-core hover:text-lunara-glow">
                Sign in →
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
