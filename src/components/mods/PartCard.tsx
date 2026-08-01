import type { Mod } from '../../types';
import { Package, AlertTriangle, Pencil } from 'lucide-react';
import { StripeTile } from '../StripeTile';
import { MOD_CATEGORY_META } from '../../lib/modCategories';

type Props = {
  mod: Mod;
  onAdvance: () => void;
  onEdit: () => void;
};

export function PartCard({ mod, onAdvance, onEdit }: Props) {
  const catMeta = MOD_CATEGORY_META[mod.cat];
  const buttonLabel = mod.stage === 'wishlist' ? 'MARK ORDERED' : mod.stage === 'ordered' ? 'MARK INSTALLED' : 'VIEW RECEIPT';
  const isInstalled = mod.stage === 'installed';

  return (
    <div className='bg-surface rounded-16 border border-border p-4 flex flex-col gap-3 relative'>
      <button
        onClick={onEdit}
        className='absolute top-3 right-3 text-ink-500 hover:text-ink-300 min-h-[32px] min-w-[32px] flex items-center justify-center'
      >
        <Pencil className='w-4 h-4' />
      </button>

      <div className='flex gap-3'>
        <StripeTile size={58} radius={12} />
        <div className='flex flex-col gap-1 pr-8'>
          <span
            className='font-display text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded-4 w-fit'
            style={{ color: catMeta.fg, backgroundColor: catMeta.bg }}
          >
            {mod.cat}
          </span>
          <h4 className='font-sans font-medium text-ink-100 text-base'>{mod.name}</h4>
          <span className='font-display text-ink-300 tabular-nums text-sm'>{mod.price.toLocaleString()} THB</span>
        </div>
      </div>

      {mod.trigger && (
        <div className='flex items-start gap-2 bg-amber-500/10 text-amber-500 p-2.5 rounded-8'>
          <AlertTriangle className='w-4 h-4 mt-0.5 shrink-0' />
          <span className='font-sans text-xs leading-relaxed'>{mod.trigger}</span>
        </div>
      )}

      <div className='flex items-start gap-2 bg-sunken text-ink-300 p-2.5 rounded-8'>
        <Package className='w-4 h-4 mt-0.5 shrink-0' />
        <div className='flex flex-col'>
          <span className='font-display text-[10px] tracking-widest uppercase mb-0.5'>ORIGINAL STOCK PART</span>
          <span className='font-sans text-xs leading-relaxed text-ink-200'>{mod.stock}</span>
        </div>
      </div>

      <div className='flex flex-col gap-2 mt-1'>
        <span className='font-sans text-xs text-ink-500'>{mod.meta}</span>
        <button
          onClick={onAdvance}
          className={isInstalled
            ? 'w-full flex items-center justify-center bg-sunken border border-border text-ink-400 font-sans font-medium py-3 rounded-12 min-h-[48px]'
            : 'w-full flex items-center justify-center bg-accent/15 border border-accent/30 text-accent-light font-sans font-medium py-3 rounded-12 min-h-[48px]'}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
