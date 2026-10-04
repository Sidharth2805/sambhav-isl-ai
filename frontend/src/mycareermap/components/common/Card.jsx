import React from 'react';
import { cn } from '../../utils/cn';

export default function Card({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) {
  return (
    <div
      className={cn(
        'bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm shadow-sm',
        hoverEffect && 'transition-all duration-200 hover:border-slate-700 hover:shadow-md hover:bg-slate-900',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
