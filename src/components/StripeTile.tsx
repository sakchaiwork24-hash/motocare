import type { ReactNode } from 'react';

type StripeTileProps = {
  size?: number;
  radius?: number;
  children?: ReactNode;
  className?: string;
};

/**
 * Diagonal-stripe placeholder tile (README: switcher/garage-row avatars, and later bike-cover /
 * part-thumb placeholders). Real photos replace this per-entity once the image picker exists.
 */
export function StripeTile({ size = 36, radius = 11, children, className = '' }: StripeTileProps) {
  return (
    <div
      className={`flex items-center justify-center shrink-0 bg-sunken ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundImage:
          'repeating-linear-gradient(135deg, rgba(148,163,184,.14) 0 2px, transparent 2px 8px)',
      }}
    >
      {children}
    </div>
  );
}
