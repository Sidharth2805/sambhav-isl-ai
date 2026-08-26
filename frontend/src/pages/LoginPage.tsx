import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../hooks/useAccessibility';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useAccessibility();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3-Image High-Resolution Animation & Hover Sequencer
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const gestureImages = [
    {
      id: 0,
      src: '/assets/isl_gesture_hello.jpg',
      title: 'Hello',
      description: 'Greeting & Welcome Sign in Indian Sign Language',
      icon: 'waving_hand',
    },
    {
      id: 1,
      src: '/assets/isl_gesture_thankyou.jpg',
      title: 'Thank you',
      description: 'Gratitude & Appreciation Sign in Indian Sign Language',
      icon: 'favorite',
    },
    {
      id: 2,
      src: '/assets/isl_gesture_sorry.jpg',
      title: 'Sorry',
      description: 'Apology & Regret Sign in Indian Sign Language',
      icon: 'sentiment_neutral',
    },
  ];

  // Auto-fill remembered email if "Keep me signed in" was enabled previously
  useEffect(() => {
    const isRemembered = localStorage.getItem('sambhav_remember_me') === 'true';
    const savedEmail = localStorage.getItem('sambhav_remembered_email') || '';
    if (isRemembered && savedEmail) {
      setRememberMe(true);
      setEmail(savedEmail);
    }
  }, []);

  // Auto-cycle through all 3 images smoothly in order when not hovered
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % gestureImages.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [isHovered, gestureImages.length]);

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

      // Handle "Keep me signed in on this device"
      if (rememberMe) {
        localStorage.setItem('sambhav_remember_me', 'true');
        localStorage.setItem('sambhav_remembered_email', email);
      } else {
        localStorage.removeItem('sambhav_remember_me');
        localStorage.removeItem('sambhav_remembered_email');
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f7fafc] dark:bg-[#030813] min-h-screen flex text-[#181c1e] dark:text-[#f7fafc] font-['Inter',sans-serif] transition-colors duration-200">
      {/* Split Screen Container */}
      <div className="flex w-full min-h-screen">
        
        {/* Left Side: Visual Storytelling & High-Res ISL Animation */}
        <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-[#121824] via-[#1a202c] to-[#0f172a] text-white">
          {/* Decorative Background Glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#fe9832]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#8dfc75]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-start gap-3">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity focus:outline-none" aria-label="SAMBHAV Home">
              <img
                alt="SAMBHAV Logo"
                className="h-11 w-11 object-contain rounded-full shadow-md"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTg0HBcA_4tr0W91LDkwqOnVSfSNqNLfncEA1PPwyGzu5JLTBXpp_wsXkZjo9tzLvf4KFNyaXk060fIQSGUovqRqh34LlLcrxxAUa5VojHfDfu4jRQJGk6QxnzQbHigwRz16MDMj2DwoCRu_i77QAzKuRLVJ8e2mLUwC7-UvMJ_JB5sui2SpIRfZM5c9yAP4gD3yTYgJBzlXm_PtIyr70gHi3MkHGC95pbUZ_Mid5Kj_my4OpeXflK15WPybnDecsYaov545CM4kLxeQ"
              />
              <span className="text-2xl font-bold tracking-tight text-white">
                SAM<span className="text-[#fe9832] font-extrabold">BHAV</span>
              </span>
            </Link>

            <h1 className="text-[38px] xl:text-[44px] font-extrabold leading-[48px] tracking-tight text-white mt-4">
              Empowering Connection.
            </h1>
            <p className="text-base leading-relaxed text-[#c1c6d7] max-w-md">
              Bridging the communication gap with AI-powered Indian Sign Language interpretation. Experience seamless interaction designed for universal accessibility.
            </p>
          </div>

          {/* High-Resolution ISL Gesture Interactive Frame */}
          <div
            className="relative z-10 w-full max-w-md mx-auto my-auto py-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Gesture Image Container */}
            <div className="aspect-[16/10] bg-[#111318] rounded-2xl shadow-2xl overflow-hidden relative border border-white/10 group">
              {gestureImages.map((img, idx) => (
                <div
                  key={img.id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    idx === activeImageIndex
                      ? 'opacity-100 scale-100 z-10'
                      : 'opacity-0 scale-105 pointer-events-none z-0'
                  }`}
                >
                  <img
                    className="w-full h-full object-cover object-top"
                    alt={`ISL Sign Gesture for ${img.title}`}
                    src={img.src}
                    loading="lazy"
                  />
                  {/* Subtle Gradient Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                </div>
              ))}

              {/* Bottom Caption Pill with live icon */}
              <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-white shadow-md">
                  <span className="material-symbols-outlined text-[#fe9832] text-[18px]">
                    {gestureImages[activeImageIndex].icon}
                  </span>
                  <div>
                    <p className="text-xs font-bold tracking-wide">
                      Sign: &quot;{gestureImages[activeImageIndex].title}&quot;
                    </p>
                    <p className="text-[10px] text-[#c1c6d7]">
                      {gestureImages[activeImageIndex].description}
                    </p>
                  </div>
                </div>

                {/* 3-Dot Interactive / Auto-cycle Indicators */}
                <div className="flex items-center gap-1.5 pointer-events-auto bg-black/40 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/10">
                  {gestureImages.map((dot, dIdx) => (
                    <button
                      key={dot.id}
                      type="button"
                      onClick={() => setActiveImageIndex(dIdx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        dIdx === activeImageIndex
                          ? 'w-5 bg-[#fe9832]'
                          : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                      aria-label={`View sign ${dot.title}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Left Footer Badges */}
          <div className="relative z-10 flex items-center justify-between text-xs text-[#828796] border-t border-white/10 pt-4">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#8dfc75]">verified_user</span>
              <span>ISLRTC Standard Compliant</span>
            </span>
            <span className="text-[11px] font-mono">v2.4.0 • Accessible Web</span>
          </div>
        </div>

        {/* Right Side: Clean Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 xl:px-16 py-12 bg-white dark:bg-[#030813] transition-colors relative">
          
          {/* Top Header Controls (Home Link & Theme Toggle) */}
          <div className="absolute top-6 right-6 flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-[#f1f4f6] dark:bg-[#151c28] border border-[#e0e3e5] dark:border-[#243044] text-[#030813] dark:text-white hover:text-[#fe9832] flex items-center justify-center transition-all shadow-xs"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle Theme"
            >
              <span className="material-symbols-outlined text-[20px]">
                {theme === 'light' ? 'dark_mode' : 'light_mode'}
              </span>
            </button>

            <Link
              to="/"
              className="text-xs font-bold text-[#45474c] dark:text-[#c1c6d7] hover:text-[#fe9832] transition-colors"
            >
              ← Back to Home
            </Link>
          </div>

          <div className="w-full max-w-md mx-auto">
            {/* Mobile Branding Logo */}
            <div className="flex lg:hidden items-center gap-2.5 mb-8">
              <Link to="/" className="flex items-center gap-2.5">
                <img
                  alt="SAMBHAV Logo"
                  className="h-10 w-10 object-contain rounded-full shadow-sm"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTg0HBcA_4tr0W91LDkwqOnVSfSNqNLfncEA1PPwyGzu5JLTBXpp_wsXkZjo9tzLvf4KFNyaXk060fIQSGUovqRqh34LlLcrxxAUa5VojHfDfu4jRQJGk6QxnzQbHigwRz16MDMj2DwoCRu_i77QAzKuRLVJ8e2mLUwC7-UvMJ_JB5sui2SpIRfZM5c9yAP4gD3yTYgJBzlXm_PtIyr70gHi3MkHGC95pbUZ_Mid5Kj_my4OpeXflK15WPybnDecsYaov545CM4kLxeQ"
                />
                <span className="text-xl font-bold tracking-tight text-[#030813] dark:text-white">
                  SAM<span className="text-[#fe9832] font-extrabold">BHAV</span>
                </span>
              </Link>
            </div>

            {/* Form Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-[#030813] dark:text-white tracking-tight">Log In</h2>
              <p className="text-xs sm:text-sm text-[#45474c] dark:text-[#828796] mt-1">
                Access your SAMBHAV dashboard and real-time workspaces.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="p-3.5 mb-5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2"
                role="alert"
              >
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#181c1e] dark:text-white" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#45474c] dark:text-[#828796] text-[18px]">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#f7fafc] dark:bg-[#151c28] border border-[#c6c6cc] dark:border-[#243044] rounded-xl text-xs sm:text-sm text-[#030813] dark:text-white focus:border-[#fe9832] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#181c1e] dark:text-white" htmlFor="password">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-bold text-[#fe9832] hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#45474c] dark:text-[#828796] text-[18px]">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 bg-[#f7fafc] dark:bg-[#151c28] border border-[#c6c6cc] dark:border-[#243044] rounded-xl text-xs sm:text-sm text-[#030813] dark:text-white focus:border-[#fe9832] outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#45474c] dark:text-[#828796] hover:text-[#030813] dark:hover:text-white"
                    aria-label="Toggle password visibility"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#fe9832] focus:ring-[#fe9832] cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-[#45474c] dark:text-[#c1c6d7] cursor-pointer select-none font-medium">
                  Keep me signed in on this device
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3.5 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-110 text-[#542900] font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer Registration Link */}
            <div className="mt-8 pt-6 border-t border-[#e0e3e5] dark:border-[#243044] text-center">
              <p className="text-xs text-[#45474c] dark:text-[#828796]">
                Don&apos;t have an account yet?{' '}
                <Link to="/register" className="font-bold text-[#fe9832] hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
