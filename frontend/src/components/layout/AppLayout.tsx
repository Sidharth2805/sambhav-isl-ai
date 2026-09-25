import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../hooks/useAccessibility';
import { Chatbot } from '../chatbot/Chatbot';
import { AccessibilityModal } from '../accessibility/AccessibilityModal';
import { AccessibilityOverlays } from '../accessibility/AccessibilityOverlays';
import { FeedbackRatingModal } from '../help/FeedbackRatingModal';

export const AppLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme, openModal, activeFeaturesCount, t } = useAccessibility();
  const navigate = useNavigate();
  
  // Sidebar hover state for Instagram web-like expansion
  const [isHovered, setIsHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackModalTab, setFeedbackModalTab] = useState<'feedback' | 'contact'>('feedback');

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showLogoutConfirm) {
        setShowLogoutConfirm(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutConfirm]);

  const handlePromptLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: t('sidebar.dashboard', 'Dashboard'),
      path: '/dashboard',
      icon: 'dashboard',
      iconColor: 'text-indigo-600 group-hover:text-indigo-700',
    },
    {
      name: t('sidebar.translate', 'Translate'),
      path: '/translate',
      icon: 'translate',
      iconColor: 'text-emerald-600 group-hover:text-emerald-700',
    },
    {
      name: t('sidebar.communicate', 'Communicate'),
      path: '/communicate',
      icon: 'forum',
      iconColor: 'text-sky-600 group-hover:text-sky-700',
    },
    {
      name: t('sidebar.cultural', 'Cultural ISL'),
      path: '/cultural-isl',
      icon: 'flag',
      iconColor: 'text-amber-500 group-hover:text-amber-600',
    },
    {
      name: t('sidebar.news', 'News'),
      path: '/news',
      icon: 'newspaper',
      iconColor: 'text-amber-600 group-hover:text-amber-700',
    },
    {
      name: t('sidebar.learn', 'Learn ISL'),
      path: '/learn-isl',
      icon: 'sign_language',
      iconColor: 'text-purple-600 group-hover:text-purple-700',
    },
    {
      name: t('sidebar.settings', 'User Settings'),
      path: '/settings',
      icon: 'settings',
      iconColor: 'text-slate-600 group-hover:text-slate-700',
    },
  ];

  if (user?.accountType === 'ADMIN') {
    navItems.push({
      name: t('sidebar.admin', 'Admin Console'),
      path: '/admin',
      icon: 'shield_person',
      iconColor: 'text-rose-600 group-hover:text-rose-700',
    });
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc] dark:bg-[#030813] text-[#0f172a] dark:text-[#f7fafc] font-['Inter',sans-serif] selection:bg-indigo-100 selection:text-indigo-800 transition-colors duration-200">
      
      {/* Mobile Top Header (Visible only on mobile screens) */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#0d121d] border-b border-[#e2e8f0] dark:border-[#2d3133] px-4 flex items-center justify-between z-40 shadow-xs">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer focus:outline-none"
          title={t('sidebar.dashboard', 'Dashboard')}
        >
          <img
            src="/logo.png"
            alt="SAMBHAV Logo"
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="text-xl font-bold tracking-tight text-[#0f172a] dark:text-white">
            SAM<span className="text-indigo-600 dark:text-[#fe9832] font-extrabold">BHAV</span>
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          {/* Direct User Settings Button */}
          <Link
            to="/settings"
            className="p-2 rounded-xl border border-[#e2e8f0] dark:border-[#2d3133] bg-[#f8fafc] dark:bg-[#1a202c] text-[#0f172a] dark:text-white hover:text-indigo-600 dark:hover:text-[#fe9832] hover:border-indigo-300 dark:hover:border-[#fe9832] cursor-pointer transition-colors"
            title="User Settings"
            aria-label="User Settings"
          >
            <span className="material-symbols-outlined text-[20px]">
              settings
            </span>
          </Link>

          {/* Feedback / Rating Modal Button */}
          <button
            onClick={() => {
              setFeedbackModalTab('feedback');
              setFeedbackModalOpen(true);
            }}
            className="p-2 rounded-xl border border-[#e2e8f0] dark:border-[#2d3133] bg-[#f8fafc] dark:bg-[#1a202c] text-[#0f172a] dark:text-white hover:text-amber-500 hover:border-amber-300 cursor-pointer transition-colors"
            title="Rate & Review App"
            aria-label="Rate & Review App"
          >
            <span className="material-symbols-outlined text-[20px] text-amber-500">
              star
            </span>
          </button>

          {/* Accessibility Options Button */}
          <button
            onClick={openModal}
            className="p-2 rounded-xl border border-[#e2e8f0] dark:border-[#2d3133] bg-[#f8fafc] dark:bg-[#1a202c] text-[#0f172a] dark:text-white hover:text-indigo-600 dark:hover:text-[#fe9832] hover:border-indigo-300 dark:hover:border-[#fe9832] cursor-pointer transition-colors relative"
            title={t('nav.accessibility', 'Accessibility & Assistive Options')}
            aria-label={t('nav.accessibility', 'Accessibility & Assistive Options')}
          >
            <span className="material-symbols-outlined text-[20px]">
              accessibility_new
            </span>
            {activeFeaturesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#fe9832] text-[#542900] text-[9px] font-black flex items-center justify-center shadow-xs">
                {activeFeaturesCount}
              </span>
            )}
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-[#e2e8f0] dark:border-[#2d3133] bg-[#f8fafc] dark:bg-[#1a202c] text-[#0f172a] dark:text-white hover:text-indigo-600 dark:hover:text-[#fe9832] hover:border-indigo-300 dark:hover:border-[#fe9832] cursor-pointer transition-colors"
            title={t('nav.themeToggle', 'Toggle Dark / Light Mode')}
            aria-label={t('nav.themeToggle', 'Toggle Dark / Light Mode')}
          >
            <span className="material-symbols-outlined text-[20px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-[#e2e8f0] dark:border-[#2d3133] bg-[#f8fafc] dark:bg-[#1a202c] text-[#0f172a] dark:text-white focus:outline-none cursor-pointer hover:border-indigo-400 dark:hover:border-[#fe9832]"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white dark:bg-[#0d121d] z-40 p-4 flex flex-col gap-2 overflow-y-auto shadow-2xl border-b border-[#e2e8f0] dark:border-[#2d3133]">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#683700] font-bold shadow-md shadow-indigo-500/25 dark:shadow-none'
                      : 'text-[#475569] dark:text-[#c1c6d7] hover:bg-slate-100 dark:hover:bg-[#1a202c] hover:text-indigo-600 dark:hover:text-[#fe9832]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-white dark:text-[#683700]' : `${item.iconColor} dark:text-inherit group-hover:dark:text-[#fe9832]`}`}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-4 border-t border-[#e2e8f0] dark:border-[#2d3133] flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setFeedbackModalTab('feedback');
                setFeedbackModalOpen(true);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">star</span>
              <span>Rate &amp; Review App</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setFeedbackModalTab('contact');
                setFeedbackModalOpen(true);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-indigo-600 dark:text-[#fe9832] hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
              <span>Contact Support Desk</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handlePromptLogout();
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span>{t('sidebar.signout', 'Sign Out')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Instagram Web Style: Icon bar by default, expands with labels on hover) */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`bg-white dark:bg-[#0d121d] text-[#0f172a] dark:text-white docked left-0 h-full flex-col p-3 gap-2 fixed hidden md:flex overflow-y-auto overflow-x-hidden z-40 border-r border-[#e2e8f0] dark:border-[#2d3133] transition-all duration-300 ease-in-out ${
          isHovered ? 'w-64 shadow-2xl' : 'w-20 shadow-xs'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center py-2 mb-2 px-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 overflow-hidden hover:opacity-90 transition-opacity cursor-pointer focus:outline-none w-full"
            title={t('sidebar.dashboard', 'Dashboard')}
          >
            <img
              src="/logo.png"
              alt="SAMBHAV Logo"
              className="h-9 w-9 rounded-full object-cover shadow-sm shrink-0"
            />
            <div
              className={`overflow-hidden transition-all duration-300 flex items-center ${
                isHovered ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0 pointer-events-none'
              }`}
            >
              <span className="font-bold text-xl tracking-tight text-[#0f172a] dark:text-white whitespace-nowrap">
                SAM<span className="text-indigo-600 dark:text-[#fe9832] font-extrabold">BHAV</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-1.5 px-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={!isHovered ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-xl text-xs font-semibold transition-all duration-200 group px-3 py-2.5 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#683700] font-bold shadow-md shadow-indigo-500/25 dark:shadow-none'
                    : 'text-[#475569] dark:text-[#c1c6d7] hover:bg-slate-100 dark:hover:bg-[#1a202c] hover:text-indigo-600 dark:hover:text-[#fe9832]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="w-6 flex items-center justify-center shrink-0">
                    <span
                      className={`material-symbols-outlined text-[22px] transition-colors ${
                        isActive
                          ? 'text-white dark:text-[#683700]'
                          : `${item.iconColor} dark:text-inherit group-hover:dark:text-[#fe9832]`
                      }`}
                    >
                      {item.icon}
                    </span>
                  </div>
                  <div
                    className={`overflow-hidden transition-all duration-300 flex items-center whitespace-nowrap ${
                      isHovered ? 'opacity-100 max-w-[170px] ml-3' : 'opacity-0 max-w-0 ml-0 pointer-events-none'
                    }`}
                  >
                    <span className="truncate font-medium text-[13px]">{item.name}</span>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Footer Actions */}
        <div className="mt-auto px-0.5 pt-3 pb-2 border-t border-[#e2e8f0] dark:border-[#2d3133] flex flex-col gap-2">
          
          {/* Rate & Review Button */}
          <button
            type="button"
            onClick={() => {
              setFeedbackModalTab('feedback');
              setFeedbackModalOpen(true);
            }}
            className="w-full py-2.5 px-3 bg-[#f8fafc] dark:bg-[#1a202c] border border-[#e2e8f0] dark:border-[#2d3133] rounded-xl text-xs font-semibold text-[#475569] dark:text-[#c1c6d7] hover:bg-amber-50 dark:hover:bg-[#2d3133] hover:text-amber-600 dark:hover:text-[#fe9832] hover:border-amber-300 dark:hover:border-[#fe9832] transition-all flex items-center relative cursor-pointer group"
            title="Rate & Review App"
          >
            <div className="w-6 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] text-amber-500">star</span>
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 flex items-center whitespace-nowrap ${
                isHovered ? 'opacity-100 max-w-[170px] ml-3' : 'opacity-0 max-w-0 ml-0 pointer-events-none'
              }`}
            >
              <span className="font-medium text-[13px]">Rate &amp; Feedback</span>
            </div>
          </button>

          {/* Accessibility Suite Options Button (UX4G Standard) */}
          <button
            type="button"
            onClick={openModal}
            className="w-full py-2.5 px-3 bg-[#f8fafc] dark:bg-[#1a202c] border border-[#e2e8f0] dark:border-[#2d3133] rounded-xl text-xs font-semibold text-[#475569] dark:text-[#c1c6d7] hover:bg-slate-100 dark:hover:bg-[#2d3133] hover:text-indigo-600 dark:hover:text-[#fe9832] hover:border-indigo-300 dark:hover:border-[#fe9832] transition-all flex items-center relative cursor-pointer group"
            title={t('sidebar.accessibility', 'Accessibility')}
          >
            <div className="w-6 flex items-center justify-center shrink-0 relative">
              <span className="material-symbols-outlined text-[20px]">accessibility_new</span>
              {!isHovered && activeFeaturesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#fe9832] text-[#542900] text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {activeFeaturesCount}
                </span>
              )}
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 flex items-center justify-between whitespace-nowrap flex-1 ${
                isHovered ? 'opacity-100 max-w-[170px] ml-3' : 'opacity-0 max-w-0 ml-0 pointer-events-none'
              }`}
            >
              <span className="font-medium text-[13px]">{t('sidebar.accessibility', 'Accessibility')}</span>
              {activeFeaturesCount > 0 && (
                <span className="px-1.5 py-0.5 bg-[#fe9832] text-[#542900] text-[10px] font-black rounded-full shadow-xs">
                  {activeFeaturesCount}
                </span>
              )}
            </div>
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full py-2.5 px-3 bg-[#f8fafc] dark:bg-[#1a202c] border border-[#e2e8f0] dark:border-[#2d3133] rounded-xl text-xs font-semibold text-[#475569] dark:text-[#c1c6d7] hover:bg-slate-100 dark:hover:bg-[#2d3133] hover:text-indigo-600 dark:hover:text-[#fe9832] hover:border-indigo-300 dark:hover:border-[#fe9832] transition-all flex items-center cursor-pointer group"
            title={t('sidebar.toggleTheme', 'Toggle Light / Dark Mode')}
          >
            <div className="w-6 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 flex items-center whitespace-nowrap ${
                isHovered ? 'opacity-100 max-w-[170px] ml-3' : 'opacity-0 max-w-0 ml-0 pointer-events-none'
              }`}
            >
              <span className="font-medium text-[13px]">
                {theme === 'dark' ? t('sidebar.lightMode', 'Light Mode') : t('sidebar.darkMode', 'Dark Mode')}
              </span>
            </div>
          </button>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handlePromptLogout}
            className="w-full py-2.5 px-3 flex items-center text-[#475569] dark:text-[#c1c6d7] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors text-xs font-semibold cursor-pointer group"
            title={t('sidebar.signout', 'Sign Out')}
          >
            <div className="w-6 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 flex items-center whitespace-nowrap ${
                isHovered ? 'opacity-100 max-w-[170px] ml-3' : 'opacity-0 max-w-0 ml-0 pointer-events-none'
              }`}
            >
              <span className="font-medium text-[13px]">{t('sidebar.signout', 'Sign Out')}</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area (Maximized screen space, offset only by icon bar width on desktop) */}
      <main className="flex-1 flex flex-col min-w-0 md:pl-20 transition-all duration-300">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pt-20 md:pt-6">
          <Outlet />
        </div>
      </main>

      {/* Embedded 24/7 Virtual Assistant */}
      <Chatbot />

      {/* UX4G Standard Accessibility Suite Modal & Overlays */}
      <AccessibilityModal />
      <AccessibilityOverlays />

      {/* Feedback & Support Modal */}
      <FeedbackRatingModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        defaultTab={feedbackModalTab}
      />

      {/* Logout Confirmation Dialog Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1a202c] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-[#2d3133] flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <span className="material-symbols-outlined text-3xl">logout</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('logout.modal.title', 'Sign Out Confirmation')}
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-[#c1c6d7] leading-relaxed">
              {t('logout.modal.message', 'Are you sure you want to end your current session and sign out of SAMBHAV?')}
            </p>
            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-[#c1c6d7] hover:bg-slate-100 dark:hover:bg-[#2d3133] transition-colors cursor-pointer"
              >
                {t('logout.modal.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors cursor-pointer"
              >
                {t('logout.modal.confirm', 'Sign Out')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
