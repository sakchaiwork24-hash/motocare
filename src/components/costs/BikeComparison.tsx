import { useBikeData } from '../../state/BikeContext';
import { costPerKm, computeMonthlySpend } from '../../lib/wear';
import { BilingualLabel } from '../BilingualLabel';
import { SectionLabel } from '../SectionLabel';

export function BikeComparison() {
  const { bikes, activeId, config } = useBikeData();

  if (!config || bikes.length < 2) return null;

  const rows = bikes.map((bike) => {
    const fuelTotal = computeMonthlySpend(bike.fuelLogs).reduce((a, m) => a + m.thb, 0);
    const maintTotal = bike.services.reduce((a, s) => a + s.cost, 0);
    return {
      id: bike.id,
      nick: bike.nick,
      costPerKm: costPerKm(config.fuelPricePerLitre, bike.kmpl),
      fuelTotal,
      maintTotal,
    };
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="px-1 mb-1">
        <BilingualLabel en="COMPARE GARAGE" thai="เทียบรถในโรงรถ" primaryClassName="text-ink-400" secondaryClassName="text-ink-400" />
      </div>

      <div className="bg-surface border border-border rounded-18 overflow-hidden">
        <div className="grid grid-cols-[1fr,auto,auto,auto] gap-2 px-3 py-2 border-b border-[rgba(51,65,85,.5)]">
          <SectionLabel size="9" tracking="normal">รถ</SectionLabel>
          <SectionLabel size="9" tracking="normal" className="text-right">฿/km</SectionLabel>
          <SectionLabel size="9" tracking="normal" className="text-right">น้ำมัน 6ด.</SectionLabel>
          <SectionLabel size="9" tracking="normal" className="text-right">ซ่อมบำรุง</SectionLabel>
        </div>

        {rows.map((row, i) => (
          <div
            key={row.id}
            className={`grid grid-cols-[1fr,auto,auto,auto] gap-2 px-3 py-2.5 items-center ${
              i < rows.length - 1 ? 'border-b border-[rgba(51,65,85,.5)]' : ''
            } ${row.id === activeId ? 'bg-[rgba(255,107,0,.07)]' : ''}`}
          >
            <div className={`font-sans font-medium text-[13px] truncate ${row.id === activeId ? 'text-accent-light' : 'text-ink-100'}`}>
              {row.nick}
            </div>
            <div className="font-display font-semibold text-[12px] text-ink-100 tabular-nums text-right">
              {row.costPerKm.toFixed(2)}
            </div>
            <div className="font-display font-semibold text-[12px] text-ink-100 tabular-nums text-right">
              ฿{row.fuelTotal.toLocaleString()}
            </div>
            <div className="font-display font-semibold text-[12px] text-ink-100 tabular-nums text-right">
              ฿{row.maintTotal.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
