import type { CSSProperties, ReactNode } from 'react';

type Tone = 'accent' | 'accent2';

const TONE_ACTIVE_CLASSES: Record<Tone, string> = {
  accent: 'bg-[rgba(255,107,0,.13)] border-[rgba(255,107,0,.5)] text-accent-light',
  accent2: 'bg-[rgba(6,182,212,.15)] border-accent2 text-accent2-light',
};

type ChipProps = {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  tone?: Tone;
  activeStyle?: CSSProperties;
  size?: 'sm' | 'md';
};

export function Chip({ active, onClick, children, tone = 'accent', activeStyle, size = 'md' }: ChipProps) {
  return (
    <button
      onClick={onClick}
      style={active ? activeStyle : undefined}
      className={`whitespace-nowrap ${size === 'sm' ? 'px-3' : 'px-4'} min-h-[36px] rounded-full font-display font-semibold text-[11px] tracking-wider uppercase transition-colors border ${
        active ? (activeStyle ? '' : TONE_ACTIVE_CLASSES[tone]) : 'bg-sunken border-border text-ink-400'
      }`}
    >
      {children}
    </button>
  );
}
