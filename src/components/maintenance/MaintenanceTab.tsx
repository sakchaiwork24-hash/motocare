import { useBikes } from '../../state/BikeContext';
import { Scoreboard } from './Scoreboard';
import { WearCardList } from './WearCardList';
import { ActionRow } from './ActionRow';
import { ServiceHistoryList } from './ServiceHistoryList';

export function MaintenanceTab() {
  const { activeBike } = useBikes();

  if (!activeBike) return null;

  return (
    <div className="flex flex-col gap-[14px]">
      <Scoreboard />
      <WearCardList />
      <ActionRow />
      <ServiceHistoryList />
    </div>
  );
}