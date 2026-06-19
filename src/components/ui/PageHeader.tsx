import React from 'react';
import { Volume2 } from 'lucide-react';
import { BackButton } from './BackButton';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onSpeak?: (e: React.MouseEvent) => void;
  onBack?: () => void;
  backTo?: string | number;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  onSpeak,
  onBack,
  backTo,
  action,
  footer,
  sticky = true,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`bg-text-primary px-4 pt-12 pb-5 rounded-b-[32px] shadow-[var(--shadow-header)] ${
        sticky ? 'sticky top-0 z-20' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-4">
        <BackButton onClick={onBack} to={backTo} />
        <div className="flex-1 text-center min-w-0">
          {subtitle && (
            <p className="text-accent/80 text-[10px] font-bold tracking-widest mb-0.5">
              {subtitle}
            </p>
          )}
          <h1 className="text-lg font-bold text-white flex items-center justify-center gap-2 truncate">
            <span className="truncate">{title}</span>
            {onSpeak && (
              <button
                type="button"
                onClick={onSpeak}
                aria-label="استمع"
                className="p-1.5 hover:bg-white/10 rounded-full transition-all duration-300 active:scale-95 shrink-0"
              >
                <Volume2 className="w-4 h-4 text-accent" />
              </button>
            )}
          </h1>
        </div>
        {action ?? <div className="w-9 shrink-0" />}
      </div>
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}
