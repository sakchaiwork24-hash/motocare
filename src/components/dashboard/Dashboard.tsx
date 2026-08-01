import { HeroCard } from './HeroCard';
import { QuickActions } from './QuickActions';
import { HealthGrid } from './HealthGrid';
import { RecentActivity } from './RecentActivity';

type DashboardProps = {
  onNavigate: (tab: 'cost' | 'maint') => void;
};

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <>
      <HeroCard />
      <QuickActions onGoToCosts={() => onNavigate('cost')} />
      <HealthGrid onGoToService={() => onNavigate('maint')} />
      <RecentActivity />
    </>
  );
}
