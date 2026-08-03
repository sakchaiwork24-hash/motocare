import { Gauge, Settings, Wrench, BarChart3, ShieldCheck } from 'lucide-react';
import type { TabType } from '../../App';
import { BilingualLabel } from '../BilingualLabel';

type BottomNavProps = {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
};

const TABS = [
  { id: 'dash', label: 'GARAGE', thai: 'โรงรถ', icon: Gauge },
  { id: 'maint', label: 'SERVICE', thai: 'ซ่อมบำรุง', icon: Settings },
  { id: 'mods', label: 'MODS', thai: 'แต่งรถ', icon: Wrench },
  { id: 'cost', label: 'COSTS', thai: 'ค่าใช้จ่าย', icon: BarChart3 },
  { id: 'vault', label: 'VAULT', thai: 'เอกสาร', icon: ShieldCheck },
] as const;

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="flex-none bg-sunken border-t border-surface flex pb-[env(safe-area-inset-bottom)]">
      {TABS.map(({ id, label, thai, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id as TabType)}
            className="relative flex-1 flex flex-col items-center justify-center min-h-[58px] touch-manipulation group select-none"
          >
            {isActive && (
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent transition-all duration-200" />
            )}
            <Icon
              size={21}
              strokeWidth={isActive ? 2.5 : 2}
              className={`mb-1 transition-colors duration-200 ${isActive ? 'text-accent' : 'text-ink-400'}`}
            />
            <BilingualLabel
              en={label}
              thai={thai}
              variant="compact"
              primaryClassName={`transition-colors duration-200 ${isActive ? 'text-accent' : 'text-ink-400'}`}
              secondaryClassName={`transition-colors duration-200 ${isActive ? 'text-accent' : 'text-ink-400'}`}
            />
          </button>
        );
      })}
    </nav>
  );
}
