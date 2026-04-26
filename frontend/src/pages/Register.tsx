import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ShieldCheck } from 'lucide-react';

export default function Register() {
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
      const res = await api.post('/auth/register', { email, password });
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-text-primary mb-2">Create Account</h1>
          <p className="text-text-secondary">Start your personalized health journey today.</p>
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
          />
          
          <Input
            label="Create Password"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />

          <p className="text-xs text-text-secondary px-1">
            By signing up, you agree to our <span className="text-accent-pink cursor-pointer">Terms</span> and <span className="text-accent-pink cursor-pointer">Privacy Policy</span>.
          </p>

          <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
            Get Started
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border-premium text-center">
          <p className="text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent-pink hover:underline">
              Sign In
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
