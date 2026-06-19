import { memo, type ReactNode } from 'react';

interface ScrollViewProps {
  children: ReactNode;
  className?: string;
}

/** Native momentum scroll — no GPU transform layer (avoids iOS touch-scroll bugs). */
export const ScrollView = memo(function ScrollView({ children, className = '' }: ScrollViewProps) {
  return (
    <div className={`native-scroll main-content-scroll ${className}`.trim()}>
      {children}
    </div>
  );
});
