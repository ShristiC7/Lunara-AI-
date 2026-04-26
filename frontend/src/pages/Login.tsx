import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { Moon, Shield, Chrome, Apple } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-bg">
      {/* Left Panel - Brand & Visual */}
      <div className="hidden md:flex md:w-[45%] bg-lunara-midnight p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated Moon Phase SVG Background (Simplified for now) */}
        <div className="absolute inset-0 opacity-20 flex items-center justify-center">
          <div className="w-[600px] h-[600px] border border-lunara-bloom/30 rounded-full animate-[spin_120s_linear_infinite]" />
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <Moon className="text-lunara-core" size={24} fill="currentColor" />
          <span className="text-xl font-bold text-white tracking-tight">
            Lunara <span className="font-normal opacity-70">AI</span>
          </span>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Your body,<br />understood.
          </h2>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-xs text-lunara-bloom">
              "Deeply insightful"
            </div>
            <div className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-xs text-lunara-bloom">
              "Privacy first"
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-500">Continue your cycle intelligence journey.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="space-y-1">
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex justify-end">
                <button type="button" className="text-xs font-semibold text-lunara-core hover:text-lunara-glow">
                  Forgot password?
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-phase-menstrual/10 border border-phase-menstrual/20 rounded-premium-md text-xs text-phase-menstrual font-medium text-center">
                {error}
              </div>
            )}

            <Button type="submit" size="md" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-default"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface-bg px-2 text-slate-400 font-medium">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border-default rounded-premium-md text-sm font-semibold text-slate-700 hover:bg-surface-sunken transition-colors">
                <Chrome size={18} className="text-slate-500" /> Google
              </button>
              <button type="button" className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border-default rounded-premium-md text-sm font-semibold text-slate-700 hover:bg-surface-sunken transition-colors">
                <Apple size={18} className="text-slate-500" /> Apple
              </button>
            </div>
          </form>

          <footer className="pt-8 space-y-4 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-lunara-core hover:text-lunara-glow">
                Start free →
              </Link>
            </p>
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Shield size={12} />
              End-to-end encrypted. Your health data stays yours.
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
