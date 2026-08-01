import type { ModCategory } from '../types';

export const MOD_CATEGORY_META: Record<ModCategory, { fg: string; bg: string }> = {
  HANDLING:    { fg: '#22D3EE', bg: 'rgba(6,182,212,.13)' },
  STYLE:       { fg: '#C4B5FD', bg: 'rgba(139,92,246,.14)' },
  PERFORMANCE: { fg: '#FF8A33', bg: 'rgba(255,107,0,.13)' },
  PROTECTION:  { fg: '#6EE7B7', bg: 'rgba(16,185,129,.12)' },
  UTILITY:     { fg: '#94A3B8', bg: 'rgba(148,163,184,.13)' },
};
