import type { PartKey } from '../types';

export type ParsedVoiceEntry = {
  partKey?: PartKey;
  odo?: number;
  cost?: number;
};

// Order matters where keywords could overlap (checked air/chain/tyre before nothing does here,
// but keep specific-first for readability).
const PART_KEYWORDS: [RegExp, PartKey][] = [
  [/น้ำมันเครื่อง/, 'oil'],
  [/กรองอากาศ|ไส้กรอง/, 'air'],
  [/เบรก/, 'brake'],
  [/โซ่/, 'chain'],
  [/ยาง/, 'tyre'],
];

/**
 * Best-effort keyword/number extraction from a Thai voice transcript — inherently approximate,
 * same honest-scoping precedent as the OCR receipt parser (Phase 5). Every field it returns is
 * shown as a normal editable input before saving, never written directly (README's explicit
 * "keep the parsed-fields confirmation before writing" requirement).
 */
export function parseVoiceEntry(transcript: string): ParsedVoiceEntry {
  const result: ParsedVoiceEntry = {};

  for (const [re, key] of PART_KEYWORDS) {
    if (re.test(transcript)) {
      result.partKey = key;
      break;
    }
  }

  const odoMatch = transcript.match(/(\d[\d,]*)\s*(?:กม\.?|กิโล(?:เมตร)?)/);
  if (odoMatch) result.odo = parseInt(odoMatch[1].replace(/,/g, ''), 10);

  const costMatch = transcript.match(/(\d[\d,]*)\s*บาท/);
  if (costMatch) result.cost = parseInt(costMatch[1].replace(/,/g, ''), 10);

  return result;
}
