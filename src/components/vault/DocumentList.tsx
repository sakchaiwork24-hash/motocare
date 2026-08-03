import type { Doc } from '../../types';
import { docCountdown, thaiDate } from '../../lib/wear';
import { docStatus, docDaysLabel } from '../../lib/vaultStatus';
import { DOC_ICON_MAP } from '../../lib/icons';
import { StripeTile } from '../StripeTile';
import { BilingualLabel } from '../BilingualLabel';

type DocumentListProps = {
  docs: Doc[];
  onOpen: (docId: Doc['id']) => void;
};

const STATUS_BORDER = { good: 'border-border', soon: 'border-soon/40', urgent: 'border-urgent/45' } as const;
const STATUS_TEXT = { good: 'text-good', soon: 'text-soon', urgent: 'text-urgent' } as const;

export function DocumentList({ docs, onOpen }: DocumentListProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="px-1">
        <BilingualLabel en="DOCUMENTS" thai="เอกสาร" primaryClassName="text-ink-500" secondaryClassName="text-ink-500" />
      </div>
      <div className="flex flex-col gap-2">
        {docs.map((doc) => {
          const days = docCountdown(doc.expiry);
          const status = docStatus(days);
          const Icon = DOC_ICON_MAP[doc.id];
          return (
            <button
              key={doc.id}
              onClick={() => onOpen(doc.id)}
              className={`min-h-[64px] flex items-center gap-3 bg-surface border rounded-16 px-3 py-2.5 text-left ${STATUS_BORDER[status]}`}
            >
              <StripeTile size={42} radius={12}>
                <Icon size={18} className="text-ink-200" />
              </StripeTile>
              <div className="flex-1 min-w-0">
                <div className="font-sans font-medium text-[13px] text-ink-100 truncate">{doc.name}</div>
                <div className="font-sans text-[10.5px] text-ink-400 truncate">
                  {doc.thai} · หมดอายุ {thaiDate(doc.expiry)}
                </div>
              </div>
              <div
                className={`shrink-0 font-display font-bold text-[11px] tracking-[.04em] px-2 py-1 rounded-8 ${STATUS_TEXT[status]}`}
              >
                {docDaysLabel(days)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
