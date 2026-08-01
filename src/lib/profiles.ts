import type { RidingProfile } from '../types';

export const PROFILE_META: Record<RidingProfile, { label: string; thai: string; note: string }> = {
  urban:   { label: 'URBAN',   thai: 'ในเมือง', note: 'Stop-and-go Bangkok traffic detected — oil, chain and brake intervals shortened 20%.' },
  mixed:   { label: 'MIXED',   thai: 'ผสม',    note: 'City and highway blend — factory service intervals applied as published.' },
  touring: { label: 'TOURING', thai: 'ทางไกล', note: 'Steady long-distance highway riding — intervals extended 15% on wear parts.' }
};
