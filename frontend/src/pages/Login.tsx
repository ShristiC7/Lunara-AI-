import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-text-primary mb-2">Welcome Back</h1>
          <p className="text-text-secondary">Enter your details to access your wellness insights.</p>
        </div>

        {error && (
          <div className="bg-peach/30 border border-peach text-accent-pink px-4 py-3 rounded-premium mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <div className="flex justify-end mt-1">
            <Link to="/forgot-password" size="sm" className="text-sm font-medium text-accent-pink hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border-premium text-center">
          <p className="text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-accent-pink hover:underline">
              Join Lunara AI
            </Link>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-secondary/70">
          <ShieldCheck size={14} />
          <span>Your data is encrypted and private</span>
        </div>
      </Card>
    </div>
  );
}
