type Size = 'lg' | 'sm';

const SIZE_CLASSES: Record<Size, { wrapper: string; label: string; value: string; sub: string }> = {
  lg: {
    wrapper: 'bg-surface border border-border rounded-16 p-3 flex flex-col justify-center',
    label: 'font-display font-semibold text-[10px] tracking-[.06em] text-ink-400 uppercase mb-1',
    value: 'font-display font-bold text-[20px] tabular-nums text-ink-50',
    sub: 'font-sans text-[11px] text-ink-400 mt-0.5',
  },
  sm: {
    wrapper: 'bg-surface border border-border rounded-14 p-3',
    label: 'font-display font-semibold text-[8.5px] tracking-[.1em] text-ink-500 uppercase',
    value: 'font-display font-bold text-[15px] text-ink-50 mt-1 tabular-nums',
    sub: 'font-sans text-[9px] text-ink-500 mt-0.5',
  },
};

type StatTileProps = {
  label: string;
  value: string;
  sub: string;
  size?: Size;
  onClick?: () => void;
};

export function StatTile({ label, value, sub, size = 'lg', onClick }: StatTileProps) {
  const c = SIZE_CLASSES[size];
  const inner = (
    <>
      <div className={c.label}>{label}</div>
      <div className={c.value}>{value}</div>
      <div className={c.sub}>{sub}</div>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={`${c.wrapper} text-left cursor-pointer active:opacity-80 transition-opacity`}>
        {inner}
      </button>
    );
  }
  return <div className={c.wrapper}>{inner}</div>;
}
