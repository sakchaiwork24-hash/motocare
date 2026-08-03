import type { Bike, Config, Rider } from '../types';

/**
 * Fixture adapted from docs/design-handoff/seed-data.json — same shape and values, with
 * display dates ("14 Apr 2026") converted once to ISO ("2026-04-14") so the rest of the app
 * only ever deals in Gregorian ISO strings (Thai display formatting happens at render time,
 * see lib/wear.ts#thaiDate). "New from dealer" is kept as-is: a real sentinel for "never
 * replaced", not a parseable date.
 */

export const seedConfig: Config = {
  fuelPricePerLitre: 37.5,
  defaultProfile: 'urban',
  bilingualThai: true,
  activeBikeId: 'zontes',
};

export const seedRider: Rider = {
  name: 'Napat Sirichai',
  nameTh: 'ณภัทร ศิริชัย',
  blood: 'O+',
  allergies: 'Penicillin · Shellfish',
  notes: 'Wears contact lenses · no other conditions',
  insurer: 'Viriyah Insurance',
  policy: 'VIR-2569-884213',
  cls: 'Class 1 · ประกันชั้น 1',
  hospital: 'Samitivej Srinakarin',
  contacts: [
    { name: 'Ploy (wife)', rel: 'ภรรยา', phone: '081-234-5678', tel: 'tel:+66812345678' },
    { name: 'Somchai (father)', rel: 'บิดา', phone: '089-876-5432', tel: 'tel:+66898765432' },
  ],
};

export const seedBikes: Bike[] = [
  {
    id: 'zontes',
    nick: 'Gray Shadow',
    brand: 'Zontes',
    model: '368G',
    year: 2024,
    plate: 'กก 8899 กรุงเทพ',
    odo: 6800,
    kmpl: 28.5,
    tank: 13.5,
    drive: 'Chain',
    photoSize: '218 KB',
    profile: 'urban',
    parts: [
      { key: 'oil', label: 'Engine Oil + Filter', thai: 'น้ำมันเครื่อง + กรอง', icon: '#ic-drop', interval: 5000, lastOdo: 4000, lastDate: '2026-04-14', prof: true, timeIntervalDays: 182 },
      { key: 'brake', label: 'Brake Pads (Front)', thai: 'ผ้าเบรกหน้า', icon: '#ic-disc', interval: 15000, lastOdo: 0, lastDate: 'New from dealer', prof: true },
      { key: 'chain', label: 'Chain Lube & Tension', thai: 'โซ่ · หล่อลื่น/ตั้งระยะ', icon: '#ic-chain', interval: 800, lastOdo: 6450, lastDate: '2026-07-19', prof: true },
      { key: 'tyre', label: 'Tyres (Front / Rear)', thai: 'ยางหน้า/หลัง', icon: '#ic-tyre', interval: 20000, lastOdo: 0, lastDate: 'New from dealer', prof: false, timeIntervalDays: 1825 },
      { key: 'air', label: 'Air Filter', thai: 'ไส้กรองอากาศ', icon: '#ic-box', interval: 8000, lastOdo: 3000, lastDate: '2026-02-02', prof: true },
    ],
    mods: [
      { id: 'm1', name: 'Öhlins STX 36 Rear Shock', cat: 'HANDLING', price: 24900, stage: 'installed', stock: 'Stock shock — boxed, bedroom closet', trigger: '', meta: 'Installed 12 May 2026 · 4,900 km' },
      { id: 'm2', name: 'Bar-End Mirror Set (CNC)', cat: 'STYLE', price: 4200, stage: 'installed', stock: 'OEM mirrors — under the bed, wrapped', trigger: '', meta: 'Installed 3 Mar 2026 · 3,100 km' },
      { id: 'm3', name: 'Radiator Guard + Slider Kit', cat: 'PROTECTION', price: 3450, stage: 'ordered', stock: 'No stock part removed', trigger: '', meta: 'Shopee · arriving 4 Aug 2026' },
      { id: 'm4', name: 'Akrapovič Slip-On Exhaust', cat: 'PERFORMANCE', price: 32000, stage: 'wishlist', stock: 'Stock exhaust stays — keep for resale', trigger: 'Needs ECU re-map + valve clearance check every 6,000 km after fitting', meta: 'Saved 18 Jun 2026' },
      { id: 'm5', name: 'Pirelli Diablo Rosso IV', cat: 'HANDLING', price: 11800, stage: 'wishlist', stock: 'Stock tyres scrapped on swap', trigger: 'Resets tyre wear tracker · softer compound = shorter life in Bangkok heat', meta: 'Saved 2 Jul 2026' },
      { id: 'm6', name: 'USB-C Charger + Phone Mount', cat: 'UTILITY', price: 1290, stage: 'wishlist', stock: 'No stock part removed', trigger: '', meta: 'Saved 21 Jul 2026' },
    ],
    fuelLogs: [
      { id: 'zf1', date: '2026-07-28', station: 'PTT Station · Rama IX', liters: 8.42, thb: 315, odo: 6800 },
      { id: 'zf2', date: '2026-07-21', station: 'Bangchak · Ladprao 71', liters: 7.9, thb: 296, odo: 6562 },
      { id: 'zf3', date: '2026-07-14', station: 'PT · Rangsit Klong 3', liters: 8.1, thb: 304, odo: 6330 },
    ],
    services: [
      { id: 'zs1', date: '2026-07-19', odo: 6450, what: 'Chain lube & tension adjust', shop: 'Zontes Bangkok · Rama IX', cost: 150 },
      { id: 'zs2', date: '2026-04-14', odo: 4000, what: 'Engine oil + filter (Motul 7100)', shop: 'Zontes Bangkok · Rama IX', cost: 890 },
      { id: 'zs3', date: '2026-02-02', odo: 3000, what: 'Air filter + valve clearance check', shop: 'Zontes Bangkok · Rama IX', cost: 1240 },
      { id: 'zs4', date: '2025-12-08', odo: 1000, what: 'First service (1,000 km)', shop: 'Zontes Bangkok · Rama IX', cost: 0 },
    ],
    docs: [
      { id: 'tax', name: 'Road Tax Sticker', thai: 'ป้ายวงกลม', expiry: '2026-08-22', issuer: 'กรมการขนส่งทางบก', icon: '#ic-cal' },
      { id: 'prb', name: 'Compulsory Insurance', thai: 'พ.ร.บ.', expiry: '2026-09-02', issuer: 'Viriyah Insurance', icon: '#ic-shield' },
      { id: 'vol', name: 'Voluntary Insurance', thai: 'ประกันชั้น 1', expiry: '2027-03-20', issuer: 'Viriyah Insurance', icon: '#ic-file' },
      { id: 'lic', name: 'Driver License', thai: 'ใบขับขี่รถจักรยานยนต์', expiry: '2029-05-08', issuer: 'DLT Bangkok', icon: '#ic-tag' },
    ],
    specs: [
      ['Engine oil', '1.8 L · 10W-40'], ['Tyre pressure', '29 / 33 PSI'], ['Spark plug', 'NGK CR8E'],
      ['Chain slack', '25–30 mm'], ['Coolant', '1.1 L · Long life'], ['Fuel', 'Gasohol 95 · 13.5 L'],
    ],
    trips: [],
  },
  {
    id: 'wave',
    nick: 'Daily Wave',
    brand: 'Honda',
    model: 'Wave 125i',
    year: 2019,
    plate: '1กท 4412 กรุงเทพ',
    odo: 42150,
    kmpl: 48.2,
    tank: 4,
    drive: 'Chain',
    photoSize: '164 KB',
    profile: 'urban',
    parts: [
      { key: 'oil', label: 'Engine Oil', thai: 'น้ำมันเครื่อง', icon: '#ic-drop', interval: 3000, lastOdo: 41900, lastDate: '2026-07-12', prof: true, timeIntervalDays: 182 },
      { key: 'brake', label: 'Brake Shoes (Rear)', thai: 'ผ้าเบรกหลัง', icon: '#ic-disc', interval: 14000, lastOdo: 33000, lastDate: '2025-09-09', prof: true },
      { key: 'chain', label: 'Chain & Sprocket Set', thai: 'โซ่และสเตอร์', icon: '#ic-chain', interval: 16000, lastOdo: 28000, lastDate: '2025-02-04', prof: true },
      { key: 'tyre', label: 'Tyres (Front / Rear)', thai: 'ยางหน้า/หลัง', icon: '#ic-tyre', interval: 18000, lastOdo: 25000, lastDate: '2024-11-20', prof: false, timeIntervalDays: 1825 },
      { key: 'air', label: 'Air Filter', thai: 'ไส้กรองอากาศ', icon: '#ic-box', interval: 12000, lastOdo: 36000, lastDate: '2026-02-02', prof: true },
    ],
    mods: [
      { id: 'w1', name: 'LED Headlight Bulb H4', cat: 'UTILITY', price: 890, stage: 'installed', stock: 'Halogen bulb — toolbox drawer', trigger: '', meta: 'Installed 8 Jan 2026 · 38,400 km' },
      { id: 'w2', name: 'Rear Rack + Delivery Box 45L', cat: 'UTILITY', price: 2350, stage: 'installed', stock: 'No stock part removed', trigger: '', meta: 'Installed 2 Aug 2025 · 31,900 km' },
      { id: 'w3', name: 'Racing Boy Rear Shock', cat: 'HANDLING', price: 2900, stage: 'wishlist', stock: 'Stock shock stays on shelf', trigger: 'Stiffer rate — check rear tyre wear every 3,000 km', meta: 'Saved 12 Jul 2026' },
    ],
    fuelLogs: [
      { id: 'wf1', date: '2026-07-29', station: 'Susco · Petchkasem', liters: 3.8, thb: 135, odo: 42150 },
      { id: 'wf2', date: '2026-07-23', station: 'PTT · Bang Wa', liters: 3.6, thb: 128, odo: 41968 },
      { id: 'wf3', date: '2026-07-16', station: 'Esso · Thonburi', liters: 3.9, thb: 139, odo: 41782 },
    ],
    services: [
      { id: 'ws1', date: '2026-07-12', odo: 41900, what: 'Engine oil (Honda 10W-30)', shop: 'ร้านช่างหนุ่ม · บางแค', cost: 320 },
      { id: 'ws2', date: '2026-02-02', odo: 36000, what: 'Air filter + spark plug', shop: 'ร้านช่างหนุ่ม · บางแค', cost: 410 },
      { id: 'ws3', date: '2025-09-09', odo: 33000, what: 'Rear brake shoes', shop: 'Honda Bigwing · Petchkasem', cost: 520 },
      { id: 'ws4', date: '2025-02-04', odo: 28000, what: 'Chain & sprocket set', shop: 'ร้านช่างหนุ่ม · บางแค', cost: 1150 },
    ],
    docs: [
      { id: 'tax', name: 'Road Tax Sticker', thai: 'ป้ายวงกลม', expiry: '2026-10-04', issuer: 'กรมการขนส่งทางบก', icon: '#ic-cal' },
      { id: 'prb', name: 'Compulsory Insurance', thai: 'พ.ร.บ.', expiry: '2026-08-11', issuer: 'Thanachart Insurance', icon: '#ic-shield' },
      { id: 'lic', name: 'Driver License', thai: 'ใบขับขี่รถจักรยานยนต์', expiry: '2029-05-08', issuer: 'DLT Bangkok', icon: '#ic-tag' },
    ],
    specs: [
      ['Engine oil', '0.8 L · 10W-30'], ['Tyre pressure', '25 / 29 PSI'], ['Spark plug', 'NGK CPR6EA-9'],
      ['Chain slack', '30–40 mm'], ['Cooling', 'Air cooled'], ['Fuel', 'Gasohol 91 · 4.0 L'],
    ],
    trips: [],
  },
  {
    id: 'vespa',
    nick: 'Bianca',
    brand: 'Vespa',
    model: 'Sprint S 150',
    year: 2022,
    plate: '2ขค 771 กรุงเทพ',
    odo: 12430,
    kmpl: 41.5,
    tank: 8,
    drive: 'Belt',
    photoSize: '202 KB',
    profile: 'urban',
    parts: [
      { key: 'oil', label: 'Engine Oil', thai: 'น้ำมันเครื่อง', icon: '#ic-drop', interval: 5000, lastOdo: 10500, lastDate: '2026-05-19', prof: true, timeIntervalDays: 182 },
      { key: 'brake', label: 'Brake Pads (Front)', thai: 'ผ้าเบรกหน้า', icon: '#ic-disc', interval: 15000, lastOdo: 0, lastDate: 'New from dealer', prof: true },
      { key: 'chain', label: 'Drive Belt + Rollers', thai: 'สายพาน + เม็ดตุ้ม', icon: '#ic-chain', interval: 10000, lastOdo: 5000, lastDate: '2025-08-11', prof: true },
      { key: 'tyre', label: 'Tyres (Front / Rear)', thai: 'ยางหน้า/หลัง', icon: '#ic-tyre', interval: 16000, lastOdo: 0, lastDate: 'New from dealer', prof: false, timeIntervalDays: 1825 },
      { key: 'air', label: 'Air Filter', thai: 'ไส้กรองอากาศ', icon: '#ic-box', interval: 9000, lastOdo: 5000, lastDate: '2025-08-11', prof: true },
    ],
    mods: [
      { id: 'v1', name: 'Chrome Rear Carrier', cat: 'STYLE', price: 3800, stage: 'installed', stock: 'No stock part removed', trigger: '', meta: 'Installed 4 Apr 2026 · 9,800 km' },
      { id: 'v2', name: 'Malossi Variator Kit', cat: 'PERFORMANCE', price: 6900, stage: 'ordered', stock: 'Stock variator — shoe box, closet', trigger: 'Belt inspection drops to every 5,000 km after fitting', meta: 'Lazada · arriving 6 Aug 2026' },
      { id: 'v3', name: 'Brown Leather Saddle Cover', cat: 'STYLE', price: 1450, stage: 'wishlist', stock: 'Original saddle stays fitted', trigger: '', meta: 'Saved 25 Jul 2026' },
    ],
    fuelLogs: [
      { id: 'vf1', date: '2026-07-27', station: 'Shell · Sathorn', liters: 6.2, thb: 238, odo: 12430 },
      { id: 'vf2', date: '2026-07-18', station: 'PTT · Silom', liters: 5.9, thb: 226, odo: 12175 },
      { id: 'vf3', date: '2026-07-08', station: 'Caltex · Rama IV', liters: 6.4, thb: 245, odo: 11930 },
    ],
    services: [
      { id: 'vs1', date: '2026-05-19', odo: 10500, what: 'Engine oil + gear oil', shop: 'Vespa Sathorn', cost: 1450 },
      { id: 'vs2', date: '2025-08-11', odo: 5000, what: 'Drive belt, rollers, air filter', shop: 'Vespa Sathorn', cost: 3900 },
      { id: 'vs3', date: '2025-03-02', odo: 2000, what: 'Second service', shop: 'Vespa Sathorn', cost: 850 },
    ],
    docs: [
      { id: 'tax', name: 'Road Tax Sticker', thai: 'ป้ายวงกลม', expiry: '2027-01-18', issuer: 'กรมการขนส่งทางบก', icon: '#ic-cal' },
      { id: 'prb', name: 'Compulsory Insurance', thai: 'พ.ร.บ.', expiry: '2027-01-18', issuer: 'Muang Thai Insurance', icon: '#ic-shield' },
      { id: 'vol', name: 'Voluntary Insurance', thai: 'ประกันชั้น 2+', expiry: '2026-12-01', issuer: 'Muang Thai Insurance', icon: '#ic-file' },
      { id: 'lic', name: 'Driver License', thai: 'ใบขับขี่รถจักรยานยนต์', expiry: '2029-05-08', issuer: 'DLT Bangkok', icon: '#ic-tag' },
    ],
    specs: [
      ['Engine oil', '1.0 L · 5W-40'], ['Tyre pressure', '26 / 33 PSI'], ['Spark plug', 'NGK CPR8EA-9'],
      ['Drive belt', '22 × 792 mm'], ['Gear oil', '0.13 L'], ['Fuel', 'Gasohol 95 · 8.0 L'],
    ],
    trips: [],
  },
];
