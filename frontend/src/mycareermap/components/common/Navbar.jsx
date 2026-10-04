import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  User,
  LogOut,
  Menu,
  X,
  ArrowRight,
  UploadCloud,
  Search,
  GitBranch,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import Button from './Button';
import ResumeUploadModal from './ResumeUploadModal';
import GuidedCareerFinderModal from './GuidedCareerFinderModal';
import CommandPalette from './CommandPalette';
import GitHubVerifierModal from './GitHubVerifierModal';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { currentLanguage, setLanguage, languages, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [matcherModalOpen, setMatcherModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Global keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand Logo */}
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Compass className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  MyCareerMap
                  <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded-md">
                    Engine
                  </span>
                </span>
              </div>
            </Link>

            {/* Right: Search, Language, Quick Actions & Auth Controls */}
            <div className="hidden md:flex items-center gap-2.5">
              {/* Command Palette Trigger */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Open Command Palette (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] hidden xl:inline">Search</span>
                <kbd className="text-[10px] font-mono px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                  Ctrl K
                </kbd>
              </button>

              {/* Language Switcher */}
              <div className="relative flex items-center">
                <select
                  value={currentLanguage}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Launch Guided Career Matcher Button */}
              <button
                onClick={() => setMatcherModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                <span>{t('nav.jobFinder', 'Career Finder')}</span>
              </button>

              {/* Quick Resume Upload Button */}
              <button
                onClick={() => setResumeModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-teal-500 text-xs font-medium text-slate-300 hover:text-teal-300 transition-colors cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 text-teal-400" />
                <span>{t('nav.uploadResume', 'Upload CV')}</span>
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <button
                    onClick={() => setGithubModalOpen(true)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white"
                    title="Verify GitHub Proof"
                  >
                    <GitBranch className="w-4 h-4 text-emerald-400" />
                  </button>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 hover:text-white transition-colors"
                  >
                    <div className="w-5 h-5 rounded bg-slate-800 text-blue-400 flex items-center justify-center text-[10px] font-bold uppercase border border-slate-700">
                      {user?.full_name ? user.full_name.charAt(0) : 'U'}
                    </div>
                    <span className="max-w-[80px] truncate">{user?.full_name || 'Profile'}</span>
                  </Link>
                  <Button variant="ghost" size="xs" onClick={handleLogout} title="Sign Out">
                    <LogOut className="w-3.5 h-3.5 text-slate-400 hover:text-red-400" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <Link to="/login">
                    <Button variant="ghost" size="xs">
                      {t('nav.signIn', 'Log in')}
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="xs" icon={ArrowRight}>
                      {t('nav.getStarted', 'Get Started')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-400 hover:text-white p-2 rounded-lg"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 pb-2 mb-2 border-b border-slate-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setMatcherModalOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-950/80 border border-blue-800 text-xs font-semibold text-blue-300"
              >
                <Compass className="w-3.5 h-3.5" /> Career Finder
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setResumeModalOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-teal-300"
              >
                <UploadCloud className="w-3.5 h-3.5" /> Upload CV
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" /> Profile ({user?.full_name})
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Modals */}
      <ResumeUploadModal
        isOpen={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
        onUploadSuccess={() => {
          navigate('/dashboard');
        }}
      />

      <GuidedCareerFinderModal
        isOpen={matcherModalOpen}
        onClose={() => setMatcherModalOpen(false)}
        onOpenResumeUpload={() => setResumeModalOpen(true)}
      />

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenResume={() => setResumeModalOpen(true)}
        onOpenMatcher={() => setMatcherModalOpen(true)}
      />

      <GitHubVerifierModal
        isOpen={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
        onSkillsVerified={() => {
          if (location.pathname === '/dashboard' || location.pathname === '/profile') {
            window.location.reload();
          }
        }}
      />
    </>
  );
}
