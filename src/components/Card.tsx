import type { ReactNode } from 'react';

const VARIANT_CLASSES = {
  /** Bare list container — clips child rows, no padding of its own. */
  list: 'rounded-18 overflow-hidden',
  /** Standalone padded card. */
  padded: 'rounded-16 p-4',
} as const;

type CardProps = {
  children: ReactNode;
  variant?: keyof typeof VARIANT_CLASSES;
  className?: string;
};

/**
 * Shared `bg-surface border border-border` card wrapper, previously hand-repeated across
 * BikeComparison/RecentActivity/FuelLogList/TripLogList/ServiceHistoryList (list variant) and
 * MonthlyBars/Scoreboard/WearCard (padded variant).
 */
export function Card({ children, variant = 'list', className = '' }: CardProps) {
  return (
    <div className={`bg-surface border border-border ${VARIANT_CLASSES[variant]} ${className}`}>
      {children}
    </div>
  );
}
