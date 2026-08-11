import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../hooks/useAccessibility';

export const RegisterPage: React.FC = () => {
  const { registerUser } = useAuth();
  const { highContrast } = useAccessibility();
  const navigate = useNavigate();

  // Multi-step: 1 = Account Info, 2 = Account Type, 3 = Needs Selection (only if ACCESSIBILITY_USER)
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [accountType, setAccountType] = useState<'COMMON_USER' | 'ACCESSIBILITY_USER'>('COMMON_USER');
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);

  // Preferences Fallbacks
  const [preferredLanguage] = useState('English');
  const [preferredSignLanguage] = useState('ISL');
  const [textSizePreference] = useState('normal');
  const [highContrastPreference] = useState(false);
  const [communicationPreference] = useState('text');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNextStep = () => {
    if (step === 1) {
      if (!name || !email || !password) {
        setError('Please fill in all required fields.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      setError(null);
      setStep(2);
    } else if (step === 2) {
      if (accountType === 'COMMON_USER') {
        // Common users proceed straight to submission
        handleRegister();
      } else {
        setError(null);
        setStep(3);
      }
    }
  };

  const handlePrevStep = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleNeedToggle = (need: string) => {
    // Validate contradictory needs (e.g. DEAF and HARD_OF_HEARING, or BLIND and LOW_VISION)
    if (need === 'DEAF' && selectedNeeds.includes('HARD_OF_HEARING')) {
      setError('Cannot select both Deaf and Hard of Hearing simultaneously.');
      return;
    }
    if (need === 'HARD_OF_HEARING' && selectedNeeds.includes('DEAF')) {
      setError('Cannot select both Deaf and Hard of Hearing simultaneously.');
      return;
    }
    if (need === 'BLIND' && selectedNeeds.includes('LOW_VISION')) {
      setError('Cannot select both Blind and Low Vision simultaneously.');
      return;
    }
    if (need === 'LOW_VISION' && selectedNeeds.includes('BLIND')) {
      setError('Cannot select both Blind and Low Vision simultaneously.');
      return;
    }

    setError(null);
    if (selectedNeeds.includes(need)) {
      setSelectedNeeds(selectedNeeds.filter((n) => n !== need));
    } else {
      setSelectedNeeds([...selectedNeeds, need]);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);

    const payload = {
      name,
      email,
      password,
      phone: phone || null,
      accountType,
      accessibilityNeeds: accountType === 'ACCESSIBILITY_USER' ? selectedNeeds : [],
      preferredLanguage: accountType === 'ACCESSIBILITY_USER' ? preferredLanguage : null,
      preferredSignLanguage: accountType === 'ACCESSIBILITY_USER' ? preferredSignLanguage : null,
      textSizePreference: accountType === 'ACCESSIBILITY_USER' ? textSizePreference : null,
      highContrastPreference: accountType === 'ACCESSIBILITY_USER' ? highContrastPreference : false,
      communicationPreference: accountType === 'ACCESSIBILITY_USER' ? communicationPreference : null,
    };

    try {
      await registerUser(payload);
      // Redirect to login with success signal in state
      navigate('/login', { state: { registrationSuccess: true } });
    } catch (err: any) {
      setError(err?.message || 'Registration failed. The email may already be in use.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text transition-colors duration-200">
      
      {/* Header */}
      <header className="border-b border-border bg-cardBg py-4 px-6 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Link to="/" className="text-2xl font-bold tracking-tight hover:opacity-85 focus:outline-none" aria-label="SignBridge Home">
            <span>Sign</span>
            <span className="text-primary font-extrabold">Bridge</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/login" className="font-semibold hover:text-primary transition-colors focus:outline-none">
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main card container */}
      <main className="flex-grow flex items-center justify-center p-6 py-12">
        <div className="card max-w-xl w-full p-8 md:p-12 flex flex-col gap-6" role="region" aria-labelledby="register-title">
          
          {/* Form Header */}
          <div className="text-center">
            <h1 id="register-title" className="text-3xl font-extrabold mb-1">Create Account</h1>
            <p className="text-sm opacity-80">Step {step} of {accountType === 'ACCESSIBILITY_USER' ? 3 : 2}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden" aria-hidden="true">
            <div 
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${(step / (accountType === 'ACCESSIBILITY_USER' ? 3 : 2)) * 100}%` }}
            />
          </div>

          {/* Alert status errors */}
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

          {/* Step 1: Basic Account Info */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-name" className="font-bold text-sm">Full Name <span className="text-primary">*</span></label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full min-h-[44px] px-3.5 rounded-lg border border-border bg-bg text-text focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-email" className="font-bold text-sm">Email Address <span className="text-primary">*</span></label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full min-h-[44px] px-3.5 rounded-lg border border-border bg-bg text-text focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-phone" className="font-bold text-sm">Phone Number (Optional)</label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full min-h-[44px] px-3.5 rounded-lg border border-border bg-bg text-text focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-password" className="font-bold text-sm">Password <span className="text-primary">*</span></label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full min-h-[44px] pl-3.5 pr-12 rounded-lg border border-border bg-bg text-text focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center font-bold text-xs opacity-75 hover:opacity-100 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '👁️' : '🕶️'}
                  </button>
                </div>
                <span className="text-xs opacity-75">Must contain at least 8 characters.</span>
              </div>
            </div>
          )}

          {/* Step 2: Account Type Selection */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-bold text-center">Select Account Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Common User Card */}
                <button
                  type="button"
                  onClick={() => setAccountType('COMMON_USER')}
                  className={`card p-6 flex flex-col text-left justify-between min-h-[140px] focus:outline-none ${
                    accountType === 'COMMON_USER' 
                      ? 'border-primary ring-2 ring-primary bg-primary/5' 
                      : 'hover:border-primary'
                  }`}
                  aria-pressed={accountType === 'COMMON_USER'}
                >
                  <div>
                    <h3 className="font-extrabold text-xl mb-1">Common User</h3>
                    <p className="text-xs opacity-85 leading-relaxed">
                      Standard account for vocal/text communication sessions.
                    </p>
                  </div>
                </button>

                {/* Accessibility User Card */}
                <button
                  type="button"
                  onClick={() => setAccountType('ACCESSIBILITY_USER')}
                  className={`card p-6 flex flex-col text-left justify-between min-h-[140px] focus:outline-none ${
                    accountType === 'ACCESSIBILITY_USER' 
                      ? 'border-primary ring-2 ring-primary bg-primary/5' 
                      : 'hover:border-primary'
                  }`}
                  aria-pressed={accountType === 'ACCESSIBILITY_USER'}
                >
                  <div>
                    <h3 className="font-extrabold text-xl mb-1">Accessibility User</h3>
                    <p className="text-xs opacity-85 leading-relaxed">
                      Tailored support including ISL Avatar animation and real-time caption controls.
                    </p>
                  </div>
                </button>

              </div>
            </div>
          )}

          {/* Step 3: Accessibility Needs (Only for ACCESSIBILITY_USER) */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-bold text-center">Select Accessibility Needs</h2>
              
              <fieldset className="flex flex-col gap-4">
                <legend className="sr-only">Accessibility Needs Checklist</legend>
                
                {/* Hearing & Speech section */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-bold text-primary">Hearing & Speech</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-cardBg hover:border-primary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedNeeds.includes('DEAF')}
                        onChange={() => handleNeedToggle('DEAF')}
                        className="w-5 h-5 rounded accent-primary"
                      />
                      <span className="text-sm font-semibold">Deaf</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-cardBg hover:border-primary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedNeeds.includes('HARD_OF_HEARING')}
                        onChange={() => handleNeedToggle('HARD_OF_HEARING')}
                        className="w-5 h-5 rounded accent-primary"
                      />
                      <span className="text-sm font-semibold">Hard of Hearing</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-cardBg hover:border-primary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedNeeds.includes('NON_SPEAKING')}
                        onChange={() => handleNeedToggle('NON_SPEAKING')}
                        className="w-5 h-5 rounded accent-primary"
                      />
                      <span className="text-sm font-semibold">Non-speaking</span>
                    </label>
                  </div>
                </div>

                {/* Visual section */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-bold text-primary">Visual Needs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-cardBg hover:border-primary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedNeeds.includes('BLIND')}
                        onChange={() => handleNeedToggle('BLIND')}
                        className="w-5 h-5 rounded accent-primary"
                      />
                      <span className="text-sm font-semibold">Blind</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-cardBg hover:border-primary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedNeeds.includes('LOW_VISION')}
                        onChange={() => handleNeedToggle('LOW_VISION')}
                        className="w-5 h-5 rounded accent-primary"
                      />
                      <span className="text-sm font-semibold">Low Vision</span>
                    </label>
                  </div>
                </div>

                {/* Other section */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-bold text-primary">Other</h3>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-cardBg hover:border-primary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedNeeds.includes('OTHER')}
                      onChange={() => handleNeedToggle('OTHER')}
                      className="w-5 h-5 rounded accent-primary"
                    />
                    <span className="text-sm font-semibold">Other Accessibility Needs</span>
                  </label>
                </div>

              </fieldset>
            </div>
          )}

          {/* Navigation Action Buttons */}
          <div className="flex justify-between gap-4 mt-2">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={loading}
                className="btn-secondary flex-1 min-h-[48px] font-bold"
              >
                Back
              </button>
            )}
            
            <button
              type="button"
              onClick={step === (accountType === 'ACCESSIBILITY_USER' ? 3 : 2) ? handleRegister : handleNextStep}
              disabled={loading}
              className="btn-primary flex-1 min-h-[48px] font-bold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  <span>Registering...</span>
                </>
              ) : step === (accountType === 'ACCESSIBILITY_USER' ? 3 : 2) ? (
                <span>Submit Registration</span>
              ) : (
                <span>Next</span>
              )}
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-cardBg py-6 px-6 text-center text-xs opacity-75 transition-colors duration-200 mt-auto">
        <span>&copy; 2026 SignBridge. Incremental Phase 2 MVP</span>
      </footer>
    </div>
  );
};
export default RegisterPage;
