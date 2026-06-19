import { memo, type ReactNode } from 'react';

interface ButtonShimmerProps {
  loading: boolean;
  children: ReactNode;
  className?: string;
}

/** Shimmer overlay for async button states — no spinners. */
export const ButtonShimmer = memo(function ButtonShimmer({
  loading,
  children,
  className = '',
}: ButtonShimmerProps) {
  return (
    <span className={`relative inline-flex items-center justify-center gap-2 ${className}`}>
      <span className={loading ? 'opacity-75' : ''}>{children}</span>
      {loading && (
        <span
          className="absolute inset-0 rounded-[inherit] skeleton-shimmer opacity-25 pointer-events-none gpu-layer"
          aria-hidden
        />
      )}
    </span>
  );
});
