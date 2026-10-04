import React from 'react';
import { cn } from '../../utils/cn';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20 focus:ring-indigo-500',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 focus:ring-slate-600',
    accent: 'bg-teal-600 hover:bg-teal-500 text-white shadow-sm shadow-teal-500/20 focus:ring-teal-500',
    outline: 'bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 focus:ring-slate-600',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white focus:ring-slate-600',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-500/20 focus:ring-red-500',
  };

  const sizes = {
    xs: 'text-xs px-3 py-1.5 gap-1.5 whitespace-nowrap',
    sm: 'text-xs px-3.5 py-2 gap-2 whitespace-nowrap',
    md: 'text-sm px-4 py-2.5 gap-2 whitespace-nowrap',
    lg: 'text-base px-5 py-3 gap-2.5 whitespace-nowrap',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 mr-1 text-current" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      {children}
    </button>
  );
}
