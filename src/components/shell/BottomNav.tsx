import { Gauge, Settings, Package, BarChart3, ShieldCheck } from 'lucide-react';
import type { TabType } from '../../App';

type BottomNavProps = {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
};

const TABS = [
  { id: 'dash', label: 'GARAGE', icon: Gauge },
  { id: 'maint', label: 'SERVICE', icon: Settings },
  { id: 'mods', label: 'MODS', icon: Package },
  { id: 'cost', label: 'COSTS', icon: BarChart3 },
  { id: 'vault', label: 'VAULT', icon: ShieldCheck },
] as const;

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="flex-none bg-sunken border-t border-surface flex pb-[env(safe-area-inset-bottom)]">
      {TABS.map(({ id, label, icon: Icon }) => {
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
            <span 
              className={`font-display font-semibold text-[8.5px] tracking-[.09em] transition-colors duration-200 ${
                isActive ? 'text-accent' : 'text-ink-400'
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
