import type { ReactNode } from 'react';

const SIZE_CLASSES = {
  '9': 'text-[9px]',
  '10': 'text-[10px]',
  '13': 'text-[13px]',
} as const;

const TRACKING_CLASSES = {
  tight: 'tracking-[.06em]',
  normal: 'tracking-[.08em]',
  wide: 'tracking-[.1em]',
} as const;

type SectionLabelProps = {
  children: ReactNode;
  size?: keyof typeof SIZE_CLASSES;
  tracking?: keyof typeof TRACKING_CLASSES;
  className?: string;
};

/**
 * Shared "eyebrow" section-label recipe (font-display font-semibold uppercase text-ink-400) that
 * was previously hand-repeated 14 times across HeroCard/MonthlyBars/TripEstimator/BikeComparison/
 * ResalePassportSheet with drifting size/tracking values — this centralizes it so future drift
 * shows up as an explicit prop choice instead of a hand-typed arbitrary value.
 */
export function SectionLabel({ children, size = '10', tracking = 'tight', className = '' }: SectionLabelProps) {
  return (
    <div className={`font-display font-semibold text-ink-400 uppercase ${SIZE_CLASSES[size]} ${TRACKING_CLASSES[tracking]} ${className}`}>
      {children}
    </div>
  );
}
