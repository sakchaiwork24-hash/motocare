import type { Mod } from '../../types';
import { PartCard } from './PartCard';

type Props = {
  mods: Mod[];
  onAdvance: (modId: string) => void;
  onEdit: (mod: Mod) => void;
  pipelineLabel: string;
};

export function PartCardList({ mods, onAdvance, onEdit, pipelineLabel }: Props) {
  if (mods.length === 0) {
    return (
      <div className='border border-dashed border-border rounded-16 p-6 flex flex-col items-center text-center gap-1'>
        <p className='font-sans text-sm text-ink-300'>Nothing in {pipelineLabel} yet</p>
        <p className='font-sans text-xs text-ink-500'>Parts you move here will show up with their stock-part storage note.</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-3'>
      {mods.map(mod => (
        <PartCard
          key={mod.id}
          mod={mod}
          onAdvance={() => onAdvance(mod.id)}
          onEdit={() => onEdit(mod)}
        />
      ))}
    </div>
  );
}
