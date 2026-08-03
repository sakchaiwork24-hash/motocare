import { StatGrid } from './StatGrid';
import { MonthlyBars } from './MonthlyBars';
import { TripEstimator } from './TripEstimator';
import { TripLogList } from './TripLogList';
import { FuelLogList } from './FuelLogList';
import { BikeComparison } from './BikeComparison';

export function CostsTab() {
  return (
    <div className="flex flex-col gap-[14px] w-full animate-mcIn">
      <StatGrid />
      <BikeComparison />
      <MonthlyBars />
      <TripEstimator />
      <TripLogList />
      <FuelLogList />
    </div>
  );
}
