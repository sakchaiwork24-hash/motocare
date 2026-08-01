import type { ModStage } from '../../types';

type Props = {
  active: ModStage;
  onChange: (stage: ModStage) => void;
  counts: Record<ModStage, number>;
};

const STAGES: { id: ModStage; label: string }[] = [
  { id: 'wishlist', label: 'WISHLIST' },
  { id: 'ordered', label: 'ORDERED' },
  { id: 'installed', label: 'INSTALLED' },
];

export function PipelineTabs({ active, onChange, counts }: Props) {
  return (
    <div className='flex gap-1 bg-sunken p-1 rounded-12'>
      {STAGES.map(s => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`flex-1 py-2 px-2 rounded-8 font-display text-[11px] tracking-wider font-semibold transition-colors flex items-center justify-center gap-1.5 min-h-[40px] ${active === s.id ? 'bg-surface text-accent-light' : 'bg-transparent text-ink-500'}`}
        >
          {s.label}
          <span className='text-[10px] tabular-nums opacity-70'>{counts[s.id]}</span>
        </button>
      ))}
    </div>
  );
}
