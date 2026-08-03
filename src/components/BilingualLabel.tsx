type BilingualLabelProps = {
  en: string;
  thai: string;
  variant?: 'block' | 'compact';
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
};

/**
 * Thai-primary, English-secondary label pair, matching the app's existing hand-rolled style
 * (WearCard.tsx's part label + ProfileChips.tsx's profile chip). `block` is the default size for
 * headers/buttons/field labels; `compact` is for tight spaces like BottomNav tabs.
 */
export function BilingualLabel({ en, thai, variant = 'block', className = '', primaryClassName = '', secondaryClassName = '' }: BilingualLabelProps) {
  const primarySize = variant === 'block' ? 'text-[13px]' : 'text-[8.5px]';
  const secondarySize = variant === 'block' ? 'text-[11px]' : 'text-[7.5px]';

  return (
    <div className={`flex flex-col ${variant === 'compact' ? 'items-center' : ''} ${className}`}>
      <span className={`font-display font-semibold uppercase tracking-[.06em] leading-tight ${primarySize} ${primaryClassName}`}>
        {thai}
      </span>
      <span className={`font-sans opacity-80 leading-tight ${secondarySize} ${secondaryClassName}`}>
        {en}
      </span>
    </div>
  );
}
