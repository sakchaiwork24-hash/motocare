import { Droplet, Disc3, Link2, CircleDot, Package, CalendarDays, ShieldCheck, FileText, Tag, LucideIcon } from 'lucide-react';
import type { DocId } from '../types';

export const PART_ICON_MAP: Record<string, LucideIcon> = {
  '#ic-drop': Droplet,
  '#ic-disc': Disc3,
  '#ic-chain': Link2,
  '#ic-tyre': CircleDot,
  '#ic-box': Package,
};

/** Verified icon mapping from README's Vault section: tax=calendar, พ.ร.บ.=shield, voluntary=file, license=tag. */
export const DOC_ICON_MAP: Record<DocId, LucideIcon> = {
  tax: CalendarDays,
  prb: ShieldCheck,
  vol: FileText,
  lic: Tag,
};
