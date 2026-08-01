import { StatGrid } from './StatGrid';
import { MonthlyBars } from './MonthlyBars';
import { TripEstimator } from './TripEstimator';
import { FuelLogList } from './FuelLogList';

export function CostsTab() {
  return (
    <div className="flex flex-col gap-[14px] w-full animate-mcIn">
      <StatGrid />
      <MonthlyBars />
      <TripEstimator />
      <FuelLogList />
    </div>
  );
}
