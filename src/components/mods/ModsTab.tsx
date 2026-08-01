import { useState } from 'react';
import { useBikes } from '../../state/BikeContext';
import { useToast } from '../../state/ToastContext';
import { advanceModStage } from '../../db';
import { FinancialOverview } from './FinancialOverview';
import { PipelineTabs } from './PipelineTabs';
import { PartCardList } from './PartCardList';
import { PartForm } from './PartForm';
import type { Mod, ModStage } from '../../types';
import { Plus } from 'lucide-react';

export function ModsTab() {
  const { activeBike } = useBikes();
  const { showToast } = useToast();
  const [pipeline, setPipeline] = useState<ModStage>('wishlist');
  const [formState, setFormState] = useState<{ open: boolean; editingMod: Mod | null }>({ open: false, editingMod: null });

  if (!activeBike) return null;

  const mods = activeBike.mods;
  const counts: Record<ModStage, number> = {
    wishlist: mods.filter(m => m.stage === 'wishlist').length,
    ordered: mods.filter(m => m.stage === 'ordered').length,
    installed: mods.filter(m => m.stage === 'installed').length,
  };
  const filteredMods = mods.filter(m => m.stage === pipeline);

  const onAdvance = async (modId: string) => {
    const mod = mods.find(m => m.id === modId);
    if (!mod) return;
    if (mod.stage === 'installed') {
      showToast(`Receipt for ${mod.name} opened from vault`);
      return;
    }
    const nextStage: ModStage = mod.stage === 'wishlist' ? 'ordered' : 'installed';
    await advanceModStage(activeBike.id, modId);
    showToast(`${mod.name} moved to ${nextStage}`);
  };

  const onEdit = (mod: Mod) => {
    setFormState({ open: true, editingMod: mod });
  };

  return (
    <div className='flex flex-col gap-3.5 w-full'>
      <FinancialOverview />
      <PipelineTabs active={pipeline} onChange={setPipeline} counts={counts} />

      <button
        onClick={() => setFormState({ open: true, editingMod: null })}
        className='w-full flex items-center justify-center gap-2 bg-sunken hover:bg-border border border-border text-ink-100 font-display font-semibold text-[13px] tracking-wider uppercase py-3 rounded-12 transition-colors min-h-[48px]'
      >
        <Plus className='w-4 h-4' />
        ADD PART
      </button>

      <PartCardList
        mods={filteredMods}
        onAdvance={onAdvance}
        onEdit={onEdit}
        pipelineLabel={pipeline}
      />

      <PartForm
        open={formState.open}
        onClose={() => setFormState({ open: false, editingMod: null })}
        editingMod={formState.editingMod}
      />
    </div>
  );
}
