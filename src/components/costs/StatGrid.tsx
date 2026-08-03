import { useBikes } from '../../state/BikeContext';
import { costPerKm, computeMonthlySpend } from '../../lib/wear';
import { useState } from 'react';
import { FuelPriceSheet } from './FuelPriceSheet';
import { StatTile } from '../StatTile';

export function StatGrid() {
  const { activeBike, config } = useBikes();
  const [fuelPriceSheetOpen, setFuelPriceSheetOpen] = useState(false);

  if (!activeBike || !config) return null;

  const fuelTotal = computeMonthlySpend(activeBike.fuelLogs).reduce((a, m) => a + m.thb, 0);
  const maintTotal = activeBike.services.reduce((a, s) => a + s.cost, 0);

  const stats: { key: string; label: string; value: string; sub: string; onClick?: () => void }[] = [
    {
      key: 'kmpl',
      label: 'อัตราสิ้นเปลือง',
      value: `${activeBike.kmpl.toFixed(1)} km/L`,
      sub: 'จากการเติมครั้งล่าสุด',
    },
    {
      key: 'costPerKm',
      label: 'ค่าใช้จ่ายต่อกม.',
      value: `${costPerKm(config.fuelPricePerLitre, activeBike.kmpl).toFixed(2)} ฿/km`,
      sub: `แก๊สโซฮอล ฿${config.fuelPricePerLitre}`,
      onClick: () => setFuelPriceSheetOpen(true),
    },
    {
      key: 'fuelTotal',
      label: 'ค่าน้ำมัน · 6 เดือน',
      value: `฿${fuelTotal.toLocaleString()}`,
      sub: `≈ ฿${Math.round(fuelTotal / 6).toLocaleString()}/เดือน`,
    },
    {
      key: 'maintTotal',
      label: 'ค่าซ่อมบำรุง',
      value: `฿${maintTotal.toLocaleString()}`,
      sub: `บันทึกไว้ ${activeBike.services.length} ครั้ง`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-[14px]">
      {stats.map((s) => (
        <StatTile key={s.key} label={s.label} value={s.value} sub={s.sub} onClick={s.onClick} />
      ))}

      <FuelPriceSheet open={fuelPriceSheetOpen} onClose={() => setFuelPriceSheetOpen(false)} />
    </div>
  );
}
