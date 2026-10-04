import React from 'react';
import { cn } from '../../utils/cn';

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    primary: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
    teal: 'bg-teal-950/80 text-teal-300 border-teal-800/60',
    green: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
    amber: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
    red: 'bg-rose-950/80 text-rose-300 border-rose-800/60',
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
