import React from 'react';
import Button from './Button';
import { cn } from '../../utils/cn';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-900/40',
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 max-w-md mt-1 mb-5">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} icon={actionIcon} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
