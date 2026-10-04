import React from 'react';
import { cn } from '../../utils/cn';

export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  ...props
}) {
  const inputId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'block w-full rounded-lg bg-slate-900 border text-slate-100 placeholder-slate-500 text-sm transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            Icon ? 'pl-9 pr-3 py-2' : 'px-3 py-2',
            error ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 hover:border-slate-600',
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}
