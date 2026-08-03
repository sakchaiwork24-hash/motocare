import type { ReactNode } from 'react';

type Tone = 'accent' | 'accent2' | 'good' | 'outline';

const TONE_CLASSES: Record<Tone, string> = {
  accent: 'bg-accent text-[#000000] font-bold',
  accent2: 'bg-accent2 text-[#000000] font-bold',
  good: 'bg-good text-[#0F172A] font-bold',
  outline: 'border border-border bg-sunken text-ink-100 font-semibold',
};

type PrimaryButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function PrimaryButton({
  onClick,
  disabled,
  tone = 'accent',
  icon,
  className = '',
  children,
}: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-h-[48px] rounded-12 font-display text-[13px] tracking-[.06em] uppercase flex items-center justify-center gap-2 active:opacity-80 transition-opacity disabled:opacity-50 ${TONE_CLASSES[tone]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
