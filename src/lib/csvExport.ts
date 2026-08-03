import type { Bike } from '../types';

/** Standard CSV escaping: wrap in quotes (doubling any internal quotes) whenever the value
 * contains a comma, quote, or newline — otherwise leave it bare. */
function toCsvCell(value: string | number): string {
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(toCsvCell).join(','));
  // UTF-8 BOM so Thai text renders correctly when opened directly in Excel, not just Sheets.
  return '﻿' + lines.join('\r\n');
}

function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Exports the active bike's service/fuel/trip history as 3 separate CSVs (different columns,
 * no reason to force them into one table) — for opening in Excel/Sheets, unlike the JSON backup
 * in backup.ts which is meant for re-importing into MotoCare itself. */
export function exportBikeHistoryCsv(bike: Bike): void {
  const today = new Date().toISOString().slice(0, 10);

  const servicesCsv = buildCsv(
    ['วันที่', 'อะไหล่', 'ร้าน', 'ค่าใช้จ่าย (บาท)', 'เลขไมล์ (กม.)', 'มีรูปใบเสร็จ'],
    bike.services.map((s) => [s.date, s.what, s.shop, s.cost, s.odo, s.receiptBlob ? 'มี' : 'ไม่มี'])
  );
  downloadCsv(`${bike.nick}-services-${today}.csv`, servicesCsv);

  const fuelCsv = buildCsv(
    ['วันที่', 'ปั๊มน้ำมัน', 'จำนวนลิตร', 'ยอดเงิน (บาท)', 'เลขไมล์ (กม.)'],
    bike.fuelLogs.map((f) => [f.date, f.station, f.liters, f.thb, f.odo])
  );
  downloadCsv(`${bike.nick}-fuel-${today}.csv`, fuelCsv);

  const tripsCsv = buildCsv(
    ['วันที่', 'ทริป', 'ระยะทาง (กม.)', 'น้ำมันที่ใช้ (ล.)', 'ค่าใช้จ่ายโดยประมาณ (บาท)'],
    (bike.trips ?? []).map((t) => [t.date, t.label, t.km, Number(t.liters.toFixed(2)), Math.round(t.cost)])
  );
  downloadCsv(`${bike.nick}-trips-${today}.csv`, tripsCsv);
}
