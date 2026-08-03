import type { RidingProfile } from '../types';

export const PROFILE_META: Record<RidingProfile, { label: string; thai: string; note: string; noteThai: string }> = {
  urban:   { label: 'URBAN',   thai: 'ในเมือง', note: 'Stop-and-go Bangkok traffic detected — oil, chain and brake intervals shortened 20%.', noteThai: 'ขับในเมืองรถติดบ่อย — ระยะเปลี่ยนน้ำมัน โซ่ และเบรก ลดลง 20%' },
  mixed:   { label: 'MIXED',   thai: 'ผสม',    note: 'City and highway blend — factory service intervals applied as published.', noteThai: 'ขับผสมในเมือง+ทางหลวง — ใช้ระยะตามมาตรฐานโรงงาน' },
  touring: { label: 'TOURING', thai: 'ทางไกล', note: 'Steady long-distance highway riding — intervals extended 15% on wear parts.', noteThai: 'ขับทางไกลต่อเนื่อง — ระยะเปลี่ยนอะไหล่สึกหรอยืดออก 15%' }
};
