'use client';

import { useHeadsUp } from '@/contexts/headup-context';
import { MonitorDot, MonitorOff } from 'lucide-react';
import clsx from 'clsx';

interface HeadsUpToggleProps {
  variant?: 'icon' | 'button';
  className?: string;
}

export function HeadsUpToggle({ variant = 'icon', className }: HeadsUpToggleProps) {
  const { enabled, toggle } = useHeadsUp();

  if (variant === 'icon') {
    return (
      <button
        onClick={toggle}
        className={clsx(
          'p-2 rounded-lg transition-colors',
          enabled
            ? 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
          className
        )}
        title={enabled ? 'Désactiver Cockpit HeadsUp' : 'Activer Cockpit HeadsUp'}
        aria-label={enabled ? 'Désactiver Cockpit HeadsUp' : 'Activer Cockpit HeadsUp'}
      >
        {enabled ? (
          <MonitorDot className="w-5 h-5" />
        ) : (
          <MonitorOff className="w-5 h-5" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className={clsx(
        'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
        enabled
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200',
        className
      )}
    >
      {enabled ? (
        <>
          <MonitorDot className="w-4 h-4" />
          <span>HeadsUp Actif</span>
        </>
      ) : (
        <>
          <MonitorOff className="w-4 h-4" />
          <span>Activer HeadsUp</span>
        </>
      )}
    </button>
  );
}
