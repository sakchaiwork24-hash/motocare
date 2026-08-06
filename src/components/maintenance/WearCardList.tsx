import { useState } from 'react';
import { useBikeData } from '../../state/BikeContext';
import { WearCard } from './WearCard';
import { EditPartProfileSheet } from './EditPartProfileSheet';
import type { Part } from '../../types';

export function WearCardList() {
  const { activeBike } = useBikeData();
  const [editingPart, setEditingPart] = useState<Part | null>(null);

  if (!activeBike) return null;

  return (
    <div className="flex flex-col gap-3">
      {activeBike.parts.map(part => (
        <WearCard
          key={part.key}
          part={part}
          bike={activeBike}
          profile={activeBike.profile}
          onEditSchedule={setEditingPart}
        />
      ))}
      <EditPartProfileSheet part={editingPart} onClose={() => setEditingPart(null)} />
    </div>
  );
}
