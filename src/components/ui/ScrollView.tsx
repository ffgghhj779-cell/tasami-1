import { memo, type ReactNode } from 'react';

interface ScrollViewProps {
  children: ReactNode;
  className?: string;
}

/** Plain wrapper — native browser scroll only; no touch interception. */
export const ScrollView = memo(function ScrollView({ children, className = '' }: ScrollViewProps) {
  return <div className={className.trim()}>{children}</div>;
});
