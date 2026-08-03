import { HeroCard } from './HeroCard';
import { QuickActions } from './QuickActions';
import { HealthGrid } from './HealthGrid';
import { RecentActivity } from './RecentActivity';

type DashboardTabProps = {
  onNavigate: (tab: 'cost' | 'maint') => void;
};

export function DashboardTab({ onNavigate }: DashboardTabProps) {
  return (
    <>
      <HeroCard />
      <QuickActions onGoToCosts={() => onNavigate('cost')} />
      <HealthGrid onGoToService={() => onNavigate('maint')} />
      <RecentActivity />
    </>
  );
}
