import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { Moon, Shield, ChevronRight, ChevronLeft, Heart, Zap } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-bg selection:bg-accent-pink-soft selection:text-lunara-core">
      {/* Left Panel - Brand & Visual */}
      <div className="hidden md:flex md:w-[45%] bg-lunara-midnight p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 flex items-center justify-center">
          <div className="w-[800px] h-[800px] border border-lunara-bloom/20 rounded-full animate-[spin_180s_linear_infinite]" />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lunara-core to-lunara-glow flex items-center justify-center shadow-lg shadow-lunara-core/20">
            <Moon className="text-white" size={20} fill="currentColor" />
          </div>
          <span className="text-2xl font-heading font-bold text-white tracking-tight">Lunara <span className="text-lunara-bloom font-normal opacity-70">AI</span></span>
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="text-5xl font-heading font-bold text-white leading-[1.1] tracking-tight">
            Start your journey to<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-pink-soft via-accent-lavender to-accent-peach-soft">body intelligence.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-sm">Deeply personalized health insights designed for the individual woman.</p>
        </div>
        <div className="relative z-10 text-slate-500 text-xs font-medium">
          © 2026 Lunara AI. Your health, your rules.
        </div>
      </div>

      {/* Right Panel - Multi-step Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 relative overflow-hidden bg-white">
        {/* Signature Background Elements */}
        <div className="hero-orb top-[-10%] right-[-5%] opacity-20 animate-float" />
        <div className="hero-orb bottom-[10%] left-[-5%] hero-orb-pink opacity-15 animate-float" style={{ animationDelay: '2s' }} />

        {/* Progress Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-50 overflow-hidden z-20">
          <div 
            className="h-full bg-gradient-to-r from-lunara-core to-lunara-glow transition-all duration-700 ease-out" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="w-full max-w-md space-y-10 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            {step === 1 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <header className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-lunara-mist flex items-center justify-center mb-6">
                    <Zap className="text-lunara-core" size={24} fill="currentColor" />
                  </div>
                  <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight">Create account</h1>
                  <p className="text-slate-500 text-lg">Secure your health data with a private account.</p>
                </header>
                <div className="space-y-5">
                  <Input 
                    label="Email Address" 
                    type="email" 
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="input-premium"
                  />
                  <div className="space-y-3">
                    <Input 
                      label="Password" 
                      type="password" 
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="input-premium"
                    />
                    <div className="flex gap-1.5 h-1 px-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${formData.password.length > i * 2 ? 'bg-lunara-core shadow-[0_0_8px_rgba(124,58,237,0.3)]' : 'bg-slate-100'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full py-4 rounded-2xl text-lg font-bold btn-premium border-none">
                  Continue <ChevronRight size={22} className="ml-1" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <button type="button" onClick={prevStep} className="text-slate-400 hover:text-slate-600 flex items-center gap-2 text-sm font-bold transition-colors group">
                  <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
                </button>
                <header className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-accent-pink-soft/20 flex items-center justify-center mb-6">
                    <Heart className="text-accent-pink-main" size={24} fill="currentColor" />
                  </div>
                  <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight">A little about you</h1>
                  <p className="text-slate-500 text-lg">This helps our AI personalize your health predictions.</p>
                </header>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 tracking-widest uppercase px-1">Age Range</label>
                    <div className="grid grid-cols-3 gap-3">
                      {ageRanges.map((range) => (
                        <button
                          key={range}
                          type="button"
                          onClick={() => setFormData({ ...formData, ageRange: range })}
                          className={`py-3.5 text-sm font-bold rounded-2xl border-2 transition-all duration-300 ${
                            formData.ageRange === range 
                              ? 'bg-white border-lunara-core text-lunara-core shadow-md ring-4 ring-lunara-core/5' 
                              : 'bg-slate-50 border-transparent text-slate-500 hover:bg-white hover:border-slate-200'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="flex justify-between items-end px-1">
                      <label className="text-xs font-bold text-slate-400 tracking-widest uppercase">Avg Cycle Length</label>
                      <span className="text-xl font-heading font-bold text-lunara-core">{formData.cycleLength} <span className="text-xs text-slate-400">days</span></span>
                    </div>
                    <div className="relative py-2">
                      <input 
                        type="range" min="21" max="45" 
                        value={formData.cycleLength}
                        onChange={(e) => setFormData({ ...formData, cycleLength: e.target.value })}
                        className="w-full accent-lunara-core h-2 bg-slate-100 rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full py-4 rounded-2xl text-lg font-bold btn-premium border-none">
                  Continue <ChevronRight size={22} className="ml-1" />
                </Button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <button type="button" onClick={prevStep} className="text-slate-400 hover:text-slate-600 flex items-center gap-2 text-sm font-bold transition-colors group">
                  <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
                </button>
                <header className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-accent-lavender/20 flex items-center justify-center mb-6">
                    <Shield className="text-accent-lavender-deep" size={24} fill="currentColor" />
                  </div>
                  <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight">Privacy & Trust</h1>
                  <p className="text-slate-500 text-lg">Your health data is a sanctuary.</p>
                </header>
                <div className="p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 space-y-6 backdrop-blur-sm">
                  <div className="flex gap-5">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                      <Shield className="text-lunara-core" size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 tracking-tight">End-to-End Encryption</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">Even we can't see your symptom logs. Your data is decrypted only on your device.</p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                      <Moon className="text-lunara-core" size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 tracking-tight">No Third-party Sharing</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">We never sell your health data to advertisers. Your data stays strictly private.</p>
                    </div>
                  </div>
                </div>
                {error && (
                  <div className="p-4 bg-phase-menstrual/5 border border-phase-menstrual/20 rounded-2xl text-sm text-phase-menstrual font-bold text-center animate-in fade-in zoom-in duration-300">
                    {error}
                  </div>
                )}
                <Button type="submit" size="lg" className="w-full py-4 rounded-2xl text-lg font-bold btn-premium border-none" isLoading={isLoading}>
                  Create My Account
                </Button>
              </div>
            )}
          </form>

          <footer className="pt-10 text-center border-t border-slate-50">
            <p className="text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-lunara-core hover:text-lunara-glow transition-colors">
                Sign in →
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
