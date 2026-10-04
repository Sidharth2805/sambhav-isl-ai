import React from 'react';
import { cn } from '../../utils/cn';

export default function LoadingSpinner({ size = 'md', className = '', label }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-4', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500',
          sizes[size]
        )}
      />
      {label && <p className="text-xs text-slate-400 font-medium">{label}</p>}
    </div>
  );
}
