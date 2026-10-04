import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        'Authentication failed. Please verify your email and password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
        <p className="text-sm text-slate-400 mt-1.5">
          Sign in to access your career maps and skill analyses
        </p>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-red-950/60 border border-red-800/80 flex items-start gap-3 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            name="email"
            icon={Mail}
            placeholder="you@domain.com"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            icon={Lock}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            className="w-full mt-2"
            loading={loading}
            icon={ArrowRight}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
}
