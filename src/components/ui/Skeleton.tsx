import React from 'react';

interface SkeletonProps {
  className?: string;
}

/** Shimmer placeholder — matches glass-card rounded geometry. */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer bg-border/40 ${className}`}
      aria-hidden="true"
    />
  );
}

/** Single booking-card skeleton row. */
export function BookingCardSkeleton() {
  return (
    <div className="glass-card rounded-[24px] p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-24 rounded-lg" />
          <Skeleton className="h-4 w-40 rounded-lg" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
      </div>
    </div>
  );
}

/** Full-page skeleton for lazy-loaded routes. */
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <div className="bg-text-primary/20 px-4 pt-12 pb-6 rounded-b-[32px]">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="w-9 h-9 rounded-full shrink-0" />
          <Skeleton className="h-6 flex-1 max-w-[160px] mx-auto rounded-xl" />
          <div className="w-9" />
        </div>
        <Skeleton className="h-4 w-48 mx-auto rounded-lg" />
      </div>
      <div className="flex-1 p-4 space-y-4">
        <Skeleton className="h-32 rounded-[28px]" />
        <Skeleton className="h-24 rounded-[28px]" />
        <Skeleton className="h-24 rounded-[28px]" />
        <BookingCardSkeleton />
        <BookingCardSkeleton />
      </div>
    </div>
  );
}

/** Map area skeleton for Booking page. */
export function MapSkeleton() {
  return (
    <div className="w-full h-full bg-bg-primary flex flex-col p-4 gap-3">
      <Skeleton className="flex-1 rounded-[24px] min-h-[200px]" />
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-12 rounded-xl" />
    </div>
  );
}

/** List of booking card skeletons for data-fetch states. */
export function BookingListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-label="جاري التحميل">
      {Array.from({ length: count }).map((_, i) => (
        <BookingCardSkeleton key={i} />
      ))}
    </div>
  );
}
