import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

/** Lightweight CSS page enter — transform + opacity only for 120fps. */
export function PageTransition({ children }: PageTransitionProps) {
  return <div className="page-enter min-h-full">{children}</div>;
}
