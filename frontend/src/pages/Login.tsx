import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { Moon, Shield, Globe, Smartphone, Sparkles } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.data.user, res.data.data.accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-bg selection:bg-accent-pink-soft selection:text-lunara-core">
      {/* Left Panel - Brand & Visual */}
      <div className="hidden md:flex md:w-[45%] bg-lunara-midnight p-16 flex-col justify-between relative overflow-hidden">
        {/* Animated Moon Phase SVG Background */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-center">
          <div className="w-[800px] h-[800px] border border-lunara-bloom/20 rounded-full animate-[spin_180s_linear_infinite]" />
          <div className="absolute w-[600px] h-[600px] border border-lunara-bloom/10 rounded-full animate-[spin_120s_linear_infinite_reverse]" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lunara-core to-lunara-glow flex items-center justify-center shadow-lg shadow-lunara-core/20">
            <Moon className="text-white" size={20} fill="currentColor" />
          </div>
          <span className="text-2xl font-heading font-bold text-white tracking-tight">
            Lunara <span className="text-lunara-bloom font-normal opacity-70">AI</span>
          </span>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-heading font-bold text-white leading-[1.1] tracking-tight">
              Your body,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-pink-soft via-accent-lavender to-accent-peach-soft">understood.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-sm leading-relaxed">
              Deeply personalized, private health insights powered by hybrid AI.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="px-5 py-2.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-sm font-medium text-lunara-bloom flex items-center gap-2">
              <Sparkles size={14} />
              Privacy first
            </div>
            <div className="px-5 py-2.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-sm font-medium text-lunara-bloom">
              80% Accuracy
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-slate-500 text-xs font-medium">
          © 2026 Lunara AI. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 relative overflow-hidden bg-white">
        {/* Signature Background Elements */}
        <div className="hero-orb top-[-10%] right-[-5%] opacity-20 animate-float" />
        <div className="hero-orb bottom-[10%] left-[-5%] hero-orb-pink opacity-15 animate-float" style={{ animationDelay: '2s' }} />

        <div className="w-full max-w-md space-y-10 relative z-10">
          <header className="space-y-3">
            <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 text-lg">Continue your cycle intelligence journey.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-premium"
              />
              <div className="space-y-2">
                <Input 
                  label="Password" 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-premium"
                />
                <div className="flex justify-end">
                  <button type="button" className="text-sm font-bold text-lunara-core hover:text-lunara-glow transition-colors">
                    Forgot password?
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-phase-menstrual/5 border border-phase-menstrual/20 rounded-2xl text-sm text-phase-menstrual font-bold text-center animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full py-4 rounded-2xl text-lg font-bold btn-premium border-none" isLoading={isLoading}>
              Sign In
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-slate-300">
                <span className="bg-white px-4">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm">
                <Globe size={18} className="text-slate-400" /> Google
              </button>
              <button type="button" className="flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm">
                <Smartphone size={18} className="text-slate-400" /> Apple
              </button>
            </div>
          </form>

          <footer className="pt-10 space-y-6 text-center border-t border-slate-50">
            <p className="text-slate-500 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-lunara-core hover:text-lunara-glow transition-colors">
                Start free →
              </Link>
            </p>
            <div className="flex items-center justify-center gap-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 py-3 rounded-xl px-4 inline-flex mx-auto">
              <Shield size={14} className="text-accent-lavender-deep" />
              End-to-end encrypted. Your health data stays yours.
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
