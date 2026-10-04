import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/onboarding');
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        'Registration failed. Please check the information provided.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-white">Create your account</h2>
        <p className="text-sm text-slate-400 mt-1.5">
          Start your personalized career intelligence journey
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
            label="Full Name"
            type="text"
            name="full_name"
            icon={User}
            placeholder="Ada Lovelace"
            value={formData.full_name}
            onChange={handleChange}
            required
            autoComplete="name"
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            icon={Mail}
            placeholder="ada@domain.com"
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
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            helperText="Use a strong password with a mix of letters and numbers"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Primary Role / Objective
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="block w-full rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="user">Student / Job Seeker</option>
              <option value="professional">Working Professional</option>
              <option value="career_switcher">Career Switcher</option>
              <option value="advisor">Academic / Career Advisor</option>
            </select>
          </div>

          <Button
            type="submit"
            className="w-full mt-3"
            loading={loading}
            icon={ArrowRight}
          >
            Create Account &amp; Continue
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
