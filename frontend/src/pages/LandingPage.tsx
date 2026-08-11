import React from 'react';
import { Link } from 'react-router-dom';
import { useAccessibility } from '../hooks/useAccessibility';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const {
    theme,
    highContrast,
    fontSize,
    toggleTheme,
    toggleHighContrast,
    increaseFontSize,
    decreaseFontSize,
  } = useAccessibility();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text transition-colors duration-200">
      
      {/* Skip Navigation for keyboard-only users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-bg px-4 py-2 rounded-md font-semibold z-50 focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Accessible Navbar */}
      <header className="border-b border-border bg-cardBg py-4 px-6 md:px-8 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight">
              Sign<span className="text-primary font-black">Bridge</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold">
              Accessibility First
            </span>
          </div>

          {/* Quick Settings & Navigation */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Font scaling tools */}
            <div className="flex items-center gap-1.5" aria-label="Adjust Font Sizing">
              <button
                onClick={decreaseFontSize}
                disabled={fontSize === 'small'}
                className="w-10 h-10 flex items-center justify-center bg-bg border border-border rounded-lg text-sm font-bold hover:bg-primary hover:text-bg disabled:opacity-40 disabled:pointer-events-none focus:outline-none"
                aria-label="Decrease text size"
              >
                A-
              </button>
              <span className="text-xs font-black min-w-[36px] text-center" aria-hidden="true">
                {fontSize === 'small' ? '85%' : fontSize === 'normal' ? '100%' : fontSize === 'large' ? '115%' : '130%'}
              </span>
              <button
                onClick={increaseFontSize}
                disabled={fontSize === 'xlarge'}
                className="w-10 h-10 flex items-center justify-center bg-bg border border-border rounded-lg text-sm font-bold hover:bg-primary hover:text-bg disabled:opacity-40 disabled:pointer-events-none focus:outline-none"
                aria-label="Increase text size"
              >
                A+
              </button>
            </div>

            {/* Dark Mode and Contrast toggles */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center bg-bg border border-border rounded-lg text-sm hover:bg-primary hover:text-bg focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button
              onClick={toggleHighContrast}
              className={`px-3 h-10 flex items-center justify-center rounded-lg border text-xs font-bold focus:outline-none ${
                highContrast
                  ? 'bg-yellow-400 text-black border-black hover:bg-yellow-300'
                  : 'bg-bg border-border hover:bg-primary hover:text-bg'
              }`}
              aria-label="Toggle high contrast colors"
            >
              👁️ HC
            </button>

            {user ? (
              <Link to="/dashboard" className="btn-primary py-2 text-xs font-bold min-h-[40px] flex items-center">
                Workspace
              </Link>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn-secondary py-2 text-xs font-bold min-h-[40px] flex items-center">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary py-2 text-xs font-bold min-h-[40px] flex items-center">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content" className="flex-grow max-w-5xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col gap-16 md:gap-24">
        
        {/* Core Hero Block */}
        <section className="text-center max-w-4xl mx-auto flex flex-col items-center gap-6" aria-labelledby="headline">
          <h1
            id="headline"
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight"
          >
            Communication without barriers.
          </h1>
          <p className="text-lg md:text-xl opacity-90 leading-relaxed max-w-3xl">
            SignBridge makes communication easier between people who use Indian Sign Language (ISL) and people who do not. Connect through sign language, speech, text, and video — wherever you are.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {user ? (
              <Link to="/dashboard" className="btn-primary px-8 py-3 text-base font-bold min-h-[48px] flex items-center">
                Enter Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary px-8 py-3 text-base font-bold min-h-[48px] flex items-center">
                  Get Started Now
                </Link>
                <Link to="/login" className="btn-secondary px-8 py-3 text-base font-bold min-h-[48px] flex items-center">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Explain the Two Modes Visually */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8" aria-labelledby="modes-title">
          <h2 id="modes-title" className="sr-only">Communication Workspaces</h2>
          
          {/* ONLINE Block */}
          <div className="card p-8 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-5xl" aria-hidden="true">🎥</span>
              <h3 className="text-2xl font-bold">Online Communication</h3>
              <p className="text-sm opacity-80 leading-relaxed">
                Connect with someone remotely through a secure call. This workspace supports video/audio streams, real-time message transcripts, and room-code invites designed to adapt for LiveKit WebRTC sessions.
              </p>
            </div>
            <div className="border-t border-border pt-4 mt-2">
              <span className="text-xs font-bold opacity-60">Ideal for: Remote calls & tele-consultations</span>
            </div>
          </div>

          {/* OFFLINE Block */}
          <div className="card p-8 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-5xl" aria-hidden="true">🤟</span>
              <h3 className="text-2xl font-bold">Offline Communication</h3>
              <p className="text-sm opacity-80 leading-relaxed">
                Communicate face-to-face in the same room. Use your camera feed to capture Indian Sign Language gestures, converting them instantly into text transcripts and synthesized spoken audio output.
              </p>
            </div>
            <div className="border-t border-border pt-4 mt-2">
              <span className="text-xs font-bold opacity-60">Ideal for: Face-to-face interactions</span>
            </div>
          </div>
        </section>

        {/* Simple 3-step guide */}
        <section className="card p-8 flex flex-col gap-8 text-center" aria-labelledby="guide-title">
          <h2 id="guide-title" className="text-2xl md:text-3xl font-bold">How it Works</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="flex flex-col gap-2 p-4 bg-bg rounded-lg">
              <span className="text-lg font-black text-primary">01</span>
              <h3 className="font-bold text-base">Setup Profile</h3>
              <p className="text-xs opacity-75">Configure accessibility preferences like high contrast, large text scaling, or preferred sign language.</p>
            </div>

            <div className="flex flex-col gap-2 p-4 bg-bg rounded-lg">
              <span className="text-lg font-black text-primary">02</span>
              <h3 className="font-bold text-base">Start Workspace</h3>
              <p className="text-xs opacity-75">Launch a remote online session via room codes, or open face-to-face camera translation panels.</p>
            </div>

            <div className="flex flex-col gap-2 p-4 bg-bg rounded-lg">
              <span className="text-lg font-black text-primary">03</span>
              <h3 className="font-bold text-base">Communicate Easily</h3>
              <p className="text-xs opacity-75">Convert signs to spoken voice output or type text to read aloud, removing barriers dynamically.</p>
            </div>
          </div>
        </section>

      </main>

      {/* Accessible Footer */}
      <footer className="border-t border-border bg-cardBg py-8 px-6 text-center text-xs opacity-80 transition-colors duration-200 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <span>&copy; 2026 SignBridge. All rights reserved.</span>
          <div className="flex gap-4 justify-center">
            <Link to="/accessibility" className="hover:underline font-bold">Accessibility Policy</Link>
            <span aria-hidden="true">|</span>
            <span>WCAG 2.1 AA Compliant</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
export default LandingPage;
