import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../hooks/useAccessibility';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { highContrast } = useAccessibility();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      // Set generic error message to prevent account validation queries
      setError(err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text transition-colors duration-200">
      
      {/* Header bar with controls */}
      <header className="border-b border-border bg-cardBg py-4 px-6 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Link to="/" className="text-2xl font-bold tracking-tight hover:opacity-85 focus:outline-none" aria-label="SignBridge Home">
            <span>Sign</span>
            <span className="text-primary font-extrabold">Bridge</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="font-semibold hover:text-primary transition-colors focus:outline-none">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-grow flex items-center justify-center p-6 py-12">
        <div className="card max-w-md w-full p-8 md:p-10 flex flex-col gap-6" role="region" aria-labelledby="login-title">
          <div className="text-center">
            <h1 id="login-title" className="text-3xl font-extrabold mb-2">Sign In</h1>
            <p className="text-sm opacity-80">Access your SignBridge communication workspace</p>
          </div>

          {/* Accessible Error Container */}
          {error && (
            <div
              className={`p-4 rounded-lg border text-sm font-semibold flex items-center gap-2 ${
                highContrast
                  ? 'bg-black text-yellow-400 border-yellow-400'
                  : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50'
              }`}
              role="alert"
              aria-live="assertive"
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email-input" className="font-bold text-sm">
                Email Address
              </label>
              <input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full min-h-[44px] px-3.5 rounded-lg border border-border bg-bg text-text focus:outline-none transition-colors"
                aria-required="true"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password-input" className="font-bold text-sm">
                Password
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[44px] pl-3.5 pr-12 rounded-lg border border-border bg-bg text-text focus:outline-none transition-colors"
                  aria-required="true"
                />
                
                {/* Show/Hide password toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center font-bold text-xs opacity-75 hover:opacity-100 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '🕶️'}
                </button>
              </div>
            </div>

            {/* Login CTA */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary min-h-[48px] font-bold text-base w-full mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Links to Register */}
          <div className="text-center text-sm border-t border-border pt-4">
            <span className="opacity-80">New to the platform? </span>
            <Link to="/register" className="font-bold text-primary hover:underline focus:outline-none focus-visible:ring-2 rounded p-1">
              Create an Account
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-cardBg py-6 px-6 text-center text-xs opacity-75 transition-colors duration-200 mt-auto">
        <span>&copy; 2026 SignBridge. All rights reserved.</span>
      </footer>
    </div>
  );
};
export default LoginPage;
