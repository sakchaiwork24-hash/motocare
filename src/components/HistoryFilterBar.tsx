import { Search } from 'lucide-react';
import { DATE_RANGE_OPTIONS, type DateRangeOption } from '../lib/historyFilter';
import { Chip } from './Chip';

type HistoryFilterBarProps = {
  query: string;
  onQueryChange: (v: string) => void;
  range: DateRangeOption;
  onRangeChange: (v: DateRangeOption) => void;
  placeholder: string;
};

export function HistoryFilterBar({ query, onQueryChange, range, onRangeChange, placeholder }: HistoryFilterBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-sunken border border-border rounded-12 pl-9 pr-3 min-h-[40px] font-sans text-[13px] text-ink-100 outline-none focus:border-accent placeholder:text-ink-500"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {DATE_RANGE_OPTIONS.map((opt) => (
          <Chip key={opt.value} active={range === opt.value} onClick={() => onRangeChange(opt.value)} size="sm">
            {opt.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
