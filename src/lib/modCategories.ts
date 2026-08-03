import type { ModCategory } from '../types';

export const MOD_CATEGORY_META: Record<ModCategory, { fg: string; bg: string; thai: string }> = {
  HANDLING:    { fg: '#22D3EE', bg: 'rgba(6,182,212,.13)', thai: 'การควบคุม' },
  STYLE:       { fg: '#C4B5FD', bg: 'rgba(139,92,246,.14)', thai: 'สไตล์' },
  PERFORMANCE: { fg: '#FF8A33', bg: 'rgba(255,107,0,.13)', thai: 'สมรรถนะ' },
  PROTECTION:  { fg: '#6EE7B7', bg: 'rgba(16,185,129,.12)', thai: 'ป้องกัน' },
  UTILITY:     { fg: '#94A3B8', bg: 'rgba(148,163,184,.13)', thai: 'อเนกประสงค์' },
};
