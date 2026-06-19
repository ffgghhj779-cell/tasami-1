import React, { memo } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

/** Lightweight CSS page enter — transform + opacity only for 120fps. */
export const PageTransition = memo(function PageTransition({ children }: PageTransitionProps) {
  return <div className="page-enter min-h-full gpu-layer">{children}</div>;
});
