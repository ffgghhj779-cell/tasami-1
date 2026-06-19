import { memo, type ReactNode } from 'react';

interface ScrollViewProps {
  children: ReactNode;
  className?: string;
}

/** GPU-friendly scroll container — momentum + containment, no layout thrash. */
export const ScrollView = memo(function ScrollView({ children, className = '' }: ScrollViewProps) {
  return (
    <div className={`native-scroll gpu-layer ${className}`.trim()}>
      {children}
    </div>
  );
});
