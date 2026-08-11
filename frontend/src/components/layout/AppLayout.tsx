import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../hooks/useAccessibility';

export const AppLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const { theme, highContrast, toggleTheme, toggleHighContrast } = useAccessibility();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      name: 'Communicate',
      path: '/communicate',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      name: 'History',
      path: '/history',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Profile & Settings',
      path: '/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  if (user?.accountType === 'ADMIN') {
    navItems.push({
      name: 'Admin Console',
      path: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    });
    navItems.push({
      name: 'ISL Catalog',
      path: '/admin/assets',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    });
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-bg text-text transition-colors duration-200">
      
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-[var(--color-sidebar-bg)] border-b border-border shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            Sign<span className="text-primary font-extrabold">Bridge</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick theme control */}
          <button
            onClick={toggleTheme}
            className="p-2 bg-bg border border-border rounded-lg text-sm hover:bg-primary hover:text-bg transition-all"
            aria-label="Toggle dark mode"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border border-border rounded-lg hover:bg-cardBg focus:outline-none"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <nav className="lg:hidden flex flex-col gap-2 p-4 bg-[var(--color-sidebar-bg)] border-b border-border" aria-label="Mobile Navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-bg font-bold'
                    : 'hover:bg-bg'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-sm font-semibold hover:bg-red-50 hover:text-red-600 transition-all text-red-500"
            aria-label="Sign out of account"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </nav>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[var(--color-sidebar-bg)] border-r border-border p-6 shadow-sm min-h-screen">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl font-bold tracking-tight">
            Sign<span className="text-primary font-extrabold">Bridge</span>
          </span>
          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-semibold">
            V1.0
          </span>
        </div>

        <nav className="flex flex-col gap-1.5 flex-grow" aria-label="Desktop Sidebar Navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-bg font-extrabold shadow-sm'
                    : 'text-text hover:bg-bg'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Controls & Footer */}
        <div className="flex flex-col gap-4 pt-6 border-t border-border mt-auto">
          {/* Quick Accessibility Toggles */}
          <div className="flex items-center gap-2" aria-label="Quick Settings">
            <button
              onClick={toggleTheme}
              className="flex-1 px-3 py-2 bg-bg border border-border rounded-lg text-xs font-bold hover:bg-primary hover:text-bg transition-all"
              aria-label="Toggle theme color"
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
            <button
              onClick={toggleHighContrast}
              className={`flex-1 px-3 py-2 rounded-lg border text-xs font-bold transition-all focus:outline-none ${
                highContrast
                  ? 'bg-yellow-400 text-black border-black font-extrabold'
                  : 'bg-bg border-border hover:bg-primary hover:text-bg'
              }`}
              aria-label="Toggle high contrast layout"
            >
              👁️ HC
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-all text-left"
            aria-label="Sign out of account"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>

          <div className="text-[10px] text-center opacity-60">
            &copy; 2026 SignBridge AI.
          </div>
        </div>
      </aside>

      {/* Main Content Scrollable Area */}
      <main className="flex-grow flex flex-col overflow-y-auto max-h-screen">
        <div className="flex-grow max-w-6xl w-full mx-auto px-6 py-8 md:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export default AppLayout;
