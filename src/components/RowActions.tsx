import { Pencil, Trash2 } from 'lucide-react';

type RowActionsProps = {
  onEdit?: () => void;
  onDelete: () => void;
};

/** Small pencil/trash icon-button pair for a history row — mirrors the pencil-icon-on-PartCard
 * convention already used for mods, extended with a delete action (native confirm, no new
 * confirm-dialog component needed for this scope). */
export function RowActions({ onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {onEdit && (
        <button
          onClick={onEdit}
          className="w-8 h-8 flex items-center justify-center text-ink-500 hover:text-ink-300"
          aria-label="Edit"
        >
          <Pencil size={14} />
        </button>
      )}
      <button
        onClick={onDelete}
        className="w-8 h-8 flex items-center justify-center text-ink-500 hover:text-urgent"
        aria-label="Delete"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
