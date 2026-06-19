import React from 'react';
import { Sparkles, Wind, Briefcase, Building2, Star } from 'lucide-react';
import type { ServiceIconType } from '../../hooks/useServices';
import { Skeleton } from './Skeleton';

const ICON_MAP: Record<ServiceIconType, React.ReactNode> = {
  sparkles:  <Sparkles className="w-6 h-6" />,
  wind:      <Wind className="w-6 h-6" />,
  briefcase: <Briefcase className="w-6 h-6" />,
  building2: <Building2 className="w-6 h-6" />,
  star:      <Star className="w-6 h-6" />,
};

export function ServiceIcon({ type }: { type: ServiceIconType }) {
  return <>{ICON_MAP[type] ?? ICON_MAP.sparkles}</>;
}

/** Horizontal service category skeleton — matches Home grid cards. */
export function ServiceGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex overflow-x-auto gap-3.5 pb-2 snap-x hide-scrollbar" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="min-w-[118px] bg-bg-card rounded-[20px] p-4 border border-border/50 flex flex-col items-center gap-3.5 snap-center shrink-0"
        >
          <Skeleton className="w-[52px] h-[52px] rounded-full" />
          <Skeleton className="h-3 w-20 rounded-lg" />
          <Skeleton className="h-3 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
