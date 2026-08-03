export type DateRangeOption = 'all' | '30d' | '90d' | 'year';

export const DATE_RANGE_OPTIONS: { value: DateRangeOption; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: '30d', label: '30 วัน' },
  { value: '90d', label: '90 วัน' },
  { value: 'year', label: 'ปีนี้' },
];

function rangeStartIso(range: DateRangeOption, now: Date): string | null {
  if (range === 'all') return null;
  if (range === '30d') return new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);
  if (range === '90d') return new Date(now.getTime() - 90 * 86400000).toISOString().slice(0, 10);
  return `${now.getFullYear()}-01-01`;
}

/**
 * Filters a list of dated records by a free-text substring match (case-insensitive, across
 * any of `textFields`) and a quick date-range window. ISO date strings ("YYYY-MM-DD") sort
 * and compare correctly as plain strings, so no date parsing is needed for the range check.
 */
export function filterByDateAndText<T extends Record<string, unknown>>(
  items: T[],
  opts: { query: string; range: DateRangeOption; dateField: keyof T; textFields: (keyof T)[] }
): T[] {
  const { query, range, dateField, textFields } = opts;
  const q = query.trim().toLowerCase();
  const start = rangeStartIso(range, new Date());

  return items.filter((item) => {
    if (start !== null && String(item[dateField]) < start) return false;
    if (q === '') return true;
    return textFields.some((field) => String(item[field] ?? '').toLowerCase().includes(q));
  });
}
