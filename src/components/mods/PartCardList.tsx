import type { Mod, ModStage } from '../../types';
import { PartCard } from './PartCard';

type Props = {
  mods: Mod[];
  onAdvance: (modId: string) => void;
  onEdit: (mod: Mod) => void;
  pipelineLabel: string;
};

const STAGE_THAI: Record<ModStage, string> = {
  wishlist: 'รายการที่อยากได้',
  ordered: 'รายการที่สั่งแล้ว',
  installed: 'รายการที่ติดตั้งแล้ว',
};

export function PartCardList({ mods, onAdvance, onEdit, pipelineLabel }: Props) {
  if (mods.length === 0) {
    return (
      <div className='border border-dashed border-border rounded-16 p-6 flex flex-col items-center text-center gap-1'>
        <p className='font-sans text-sm text-ink-300'>ยังไม่มี{STAGE_THAI[pipelineLabel as ModStage] ?? pipelineLabel}</p>
        <p className='font-sans text-xs text-ink-500'>เมื่อย้ายอะไหล่มาไว้ที่นี่ จะแสดงจุดเก็บอะไหล่เดิมให้ด้วย</p>
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
