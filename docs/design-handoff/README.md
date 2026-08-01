# Handoff: MotoCare — Motorcycle Care PWA (Thailand)

## Overview
MotoCare is a dark-themed, mobile-first PWA for daily motorcycle commuters and enthusiasts in
Thailand. One rider owns a "digital garage" of bikes; per bike the app tracks odometer, predictive
wear on consumables, modification projects, fuel/expense analytics, legal documents with expiry
countdowns, and emergency (ICE) data. Copy is bilingual EN/TH, currency is THB (฿), and document
types are Thai-specific (ป้ายวงกลม, พ.ร.บ., ประกันชั้น 1, ใบขับขี่).

Primary jobs to be done:
1. Log a fuel fill in under 10 seconds at the pump (OCR receipt scan), while wearing gloves.
2. Know at a glance what service is due, adjusted to how the bike is actually ridden.
3. Keep documents/insurance from expiring, and have ICE data reachable by a stranger after a crash.
4. Prove maintenance history when selling the bike second-hand.

## About the Design Files
`MotoCare.dc.html` in this bundle is a **design reference created in HTML** — a working prototype
that shows intended look, copy, and behavior. It is **not production code to copy directly**.
It is a single self-contained file: an inline-styled template plus a JavaScript logic class holding
all mock data and state.

The task is to **recreate this design in the target codebase's existing environment** (React Native,
React + Tailwind, Vue, SwiftUI, Flutter, …) using that codebase's established patterns, component
library, navigation, and data layer. If no codebase exists yet, pick the most appropriate framework
for a PWA-first product (the original brief assumed React + Tailwind CSS + Lucide React icons) and
implement the designs there.

Two deliberate deviations from the original brief that you should undo in the real implementation:
- **Styling** is inline in the prototype because the design tool requires it. In the app, use
  Tailwind utility classes (the tokens below map 1:1 to Tailwind's slate/orange/cyan/emerald/amber/rose scales).
- **Icons** are a hand-built 24×24 stroke sprite (`<symbol>` + `<use>`), because Lucide was not
  available in the prototype environment. In the app, use `lucide-react`. Mapping table below.

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, radii, animation timings and all copy are
final. Recreate the UI faithfully with the codebase's own libraries. Layout is fixed-width mobile
(390–400 px design width); everything scales from a centered `max-w-md` column.

---

## Global Shell

Frame: centered column, 400 px wide, 868 px tall in the prototype (`max-height: 100vh - 44px`),
radius 44 px, `#0F172A` on a `#05070C` page. In the real app this is simply the device viewport —
drop the frame, keep the vertical structure:

```
┌─ status bar (device)
├─ HEADER (sticky, bg #0F172A, bottom border rgba(51,65,85,.6))
│   ├─ row 1: garage switcher button (flex 1) + sync badge (52×52)
│   ├─ row 2: 2 spec chips + SPECS toggle (right-aligned)
│   └─ row 3 (conditional): factory-specs drawer, 2-col grid
├─ SCROLL AREA (flex 1, overflow-y auto, padding 14px 14px 22px, gap 13–14px between blocks)
├─ BOTTOM NAV (flex none, bg #0B1120, top border #1E293B, 5 items, each min-height 58px)
└─ overlays: toast (bottom 78px), sheets/modals (absolute inset 0)
```

### 1. Global header & garage switcher
- **Switcher button** — min-height 52 px, bg `#1E293B`, border 1 px `#334155`, radius 16 px,
  padding 8/12. Left: 36×36 radius-11 tile with diagonal-stripe fill and the brand initial in
  orange (`#FF6B00`, Chakra Petch 700 13 px). Then nickname (Chakra Petch 700 15px/1.1 `#F1F5F9`,
  truncated) + chevron-down 15 px orange; below it `brand model` (IBM Plex Sans Thai 400 11px/1.3
  `#94A3B8`). Hover: border → `#FF6B00`.
- **Sync badge** — 52×52 tap target, column layout: 8 px dot + label + sub. Two states, tapping
  toggles them (in production, derive from real connectivity + a queued-mutation count):
  - offline → amber `#F59E0B`, "OFFLINE" / "2 queued"
  - online → cyan `#06B6D4`, "SYNCED" / "just now"
  The dot blinks (`opacity 1 → .25`, 2.4 s ease-in-out infinite).
- **Garage dropdown** — full-screen scrim `rgba(2,6,15,.66)`; panel at top 120 px, inset 14 px,
  bg `#1E293B`, border `#334155`, radius 20 px, padding 10 px, shadow `0 26px 50px -12px rgba(0,0,0,.8)`,
  enter animation `mcIn` (translateY 10px + fade, .2 s ease-out). Header label "MY GARAGE · {n} BIKES"
  (Chakra Petch 600 9 px, tracking .14em, `#64748B`). Rows are min-height 56 px buttons: stripe tile
  + nickname + "brand model · 42,150 km"; active row bg `rgba(255,107,0,.1)`, border `rgba(255,107,0,.5)`,
  check icon orange. Last row: dashed orange "ADD NEW BIKE" (min-height 48 px).
  Selecting a bike closes the panel, resets the mods pipeline to Wishlist, re-runs all bar/ring
  animations, and fires a toast "Switched to {nick} · data reloaded".
- **Quick specs** — two cyan chips: droplet icon + engine-oil spec ("1.8 L · 10W-40"), tyre icon +
  pressure ("29 / 33 PSI"). Chip: bg `rgba(6,182,212,.09)`, border `rgba(6,182,212,.28)`, radius 9 px,
  padding 5/8, label Chakra Petch 600 10 px `#67E8F9`, `white-space: nowrap`. The SPECS button
  expands a drawer (bg `#0B1120`, border `#334155`, radius 14 px) with a 2-column grid of 6
  key/value pairs per model: engine oil, tyre pressure, spark plug, chain slack / drive belt,
  coolant or cooling, fuel grade + tank size.

### 2. Bottom navigation
5 items, `flex: 1` each, min-height 58 px (glove-friendly): 3 px orange indicator bar flush to the
top edge of the active item, 21 px icon, then label (Chakra Petch 600 8.5 px, tracking .09em).
Active `#FF6B00`, inactive `#64748B`, color transition .2 s.
Order and icons: GARAGE (gauge) · SERVICE (cog) · MODS (package) · COSTS (bar-chart) · VAULT (shield).

---

## Screens / Views

### TAB 1 — GARAGE (dashboard)
**Purpose:** at-a-glance state of the active bike; entry point for the three fast actions.

- **Hero card** — radius 22 px, border `#334155`, bg `#1E293B`.
  Photo area 176 px tall; in production this is the user's uploaded cover photo, `object-fit: cover`,
  with a top-down scrim `linear-gradient(180deg, rgba(15,23,42,0) 30%, rgba(15,23,42,.86) 72%, #1E293B 100%)`.
  The prototype substitutes a diagonal-stripe placeholder plus a camera glyph and the monospace
  hint "drop bike cover photo" — replace with a real image picker + empty state.
  Overlays: top-left pill "COMPRESSED · 218 KB" (emerald check, bg `rgba(2,6,15,.72)`, radius 8 px) —
  this is the client-side compression receipt, show real output size; top-right model year pill.
  Bottom-left: nickname (Chakra Petch 700 22px/1.05 `#F8FAFC`) and "brand model · plate".
  Card footer row: left "ODOMETER" label + value (Chakra Petch 700 32 px, tabular-nums) + "KM" in
  orange; right "HEALTH" label + status dot + score % in the status color.
- **Quick action group** — 3-up grid, gap 8 px, each min-height 76 px, radius 16 px, icon top-left,
  label + sub bottom-left:
  1. LOG FUEL / "OCR scan" — bg `rgba(255,107,0,.13)`, border `rgba(255,107,0,.42)`, fg `#FF8A33` → opens Log Fuel sheet
  2. SERVICE / "record job" — bg `#1E293B`, border `#334155`, fg `#E2E8F0` → opens Record Service sheet (part prefilled `oil`, odo prefilled)
  3. TRIP CALC / "fuel + cost" — bg `rgba(6,182,212,.11)`, border `rgba(6,182,212,.34)`, fg `#22D3EE` → switches to COSTS tab and flashes the trip widget border cyan for 1.4 s
- **Bike health grid** — section header "BIKE HEALTH" + "DETAILS ›" link (cyan) to the SERVICE tab.
  2×2 cards (bg `#1E293B`, border `#334155`, radius 18 px, padding 12 px): 56 px circular progress
  ring + part name, remaining % in status color (Chakra Petch 700 15 px), and sub-line
  "1,200 km left" / "overdue 510 km".
  Ring: SVG 56×56, rotated −90°, r = 23, stroke-width 6, track `#0F172A`, `stroke-linecap: round`,
  `stroke-dasharray: {pct/100 × 144.5} 144.5`, transition `stroke-dasharray 1s cubic-bezier(.22,1,.36,1)`.
  Animates from 0 on mount, on bike switch, on riding-profile change, and after any log save.
  The part icon sits centered inside the ring in the status color.
- **Recent activity** — up to 4 rows interleaving fuel logs and services, newest first: 32 px tinted
  icon tile (fuel = cyan tint, service = orange tint), title, sub ("station" / "shop · 6,450 km"),
  right-aligned short date ("28 Jul").

### TAB 2 — SERVICE (smart maintenance, predictive wear)
**Purpose:** show what is due, adjusted for riding style, and log replacements.

- **Scoreboard card** — 74 px ring (r = 31, stroke-width 8, circumference 194.8) with the average
  health score and "SCORE" inside; headline copy keyed to the score
  (`≥55` "Bike is in good shape", `35–54` "Service window opening", `<35` "Service needed now"),
  and the active profile note underneath.
- **Riding profile chips** — 3 equal chips, min-height 44 px: URBAN / ในเมือง, MIXED / ผสม,
  TOURING / ทางไกล. Active: bg `rgba(255,107,0,.13)`, border `rgba(255,107,0,.5)`, fg `#FF8A33`.
  Selecting one recomputes every interval and re-animates all bars.
  Notes shown under the score:
  - urban ×0.8 — "Stop-and-go Bangkok traffic detected — oil, chain and brake intervals shortened 20%."
  - mixed ×1.0 — "City and highway blend — factory service intervals applied as published."
  - touring ×1.15 — "Steady long-distance highway riding — intervals extended 15% on wear parts."
- **Maintenance card, one per consumable** (5 per bike) — radius 18 px, border `#334155`
  (or `rgba(244,63,94,.42)` when urgent). 36 px tinted icon tile; title + status badge
  (GOOD / SERVICE SOON / URGENT / OVERDUE, 8.5 px Chakra Petch on a 12 %-tint chip in the status color);
  Thai subtitle; then the big number (Chakra Petch 700 19 px in status color) + "km remaining · urban profile"
  (or "km past due · …"); an 7 px progress bar (track `#0F172A`, radius 99 px, width transition
  `1s cubic-bezier(.22,1,.36,1)`); footer line "Last: 14 Apr 2026 @ 4,000 km · every 4,000 km" and a
  32 px "LOG REPLACEMENT" button (orange 12 % tint).
- **Action row** — 2-up: VOICE ENTRY (cyan, "พูดแทนพิมพ์ · TH/EN") and SCAN RECEIPT (neutral,
  "OCR · อ่านใบเสร็จ").

### TAB 3 — MODS (project bike tracker)
- **Financial overview** — "PROJECT SPEND" + installed total (Chakra Petch 700 26 px) + "THB", sub
  "{n} parts installed on {nick}"; right column "WISHLIST" + pending total in cyan + "{n} items pending".
  Below: a 9 px 3-segment stacked bar (orange installed / amber ordered / cyan wishlist, widths as %
  of the sum, 1 s width transition) and a legend with the ordered total spelled out.
- **Pipeline tabs** — segmented control in a `#0B1120` well (radius 14 px, padding 4 px): WISHLIST /
  ORDERED / INSTALLED, each with a count badge; active segment bg `#1E293B`, fg `#FF8A33`.
- **Part card** — 58 px stripe thumbnail placeholder (replace with the part photo), name, category
  chip, price (tabular-nums) + "THB". Category colors: HANDLING cyan `#22D3EE`, STYLE violet
  `#C4B5FD`, PERFORMANCE orange `#FF8A33`, PROTECTION emerald `#6EE7B7`, UTILITY slate `#94A3B8`
  (each on a ~13 % tint of the same hue).
  Optional **maintenance-trigger warning** (only when the part has one): amber row, alert icon +
  copy, e.g. "Needs ECU re-map + valve clearance check every 6,000 km after fitting".
  Always-present **stock-part row**: bg `#0B1120`, box icon, label "ORIGINAL STOCK PART" +
  free-text location, e.g. "Stock shock — boxed, bedroom closet".
  Footer: meta line (ordered/installed date, marketplace + ETA) and a stage-advance button:
  Wishlist → "MARK ORDERED", Ordered → "MARK INSTALLED", Installed → "VIEW RECEIPT" (neutral styling).
  Advancing rewrites the meta line ("Ordered today · ETA 5–7 days" / "Installed today @ 7,047 km")
  and fires a toast.
- **Empty state** per pipeline: dashed border, "Nothing in {pipeline} yet" + one explanatory line.

### TAB 4 — COSTS (expenses & trip estimator)
- **Stat grid** 2×2: AVG CONSUMPTION (km/L, "last 6 fill-ups"), COST PER KM (฿/km, "gasohol at ฿37.50"),
  FUEL · 6 MONTHS (฿ total, "≈ ฿1,137/month"), MAINTENANCE (฿ total, "{n} logged services").
  Value Chakra Petch 700 21 px `#F8FAFC` tabular-nums; unit in the card's accent color.
- **Monthly fuel spend** — 6 bars, 104 px plot height, `height: value/max × 76 + 8 px`, radius
  6 px top / 3 px bottom, 1 s height transition; latest month orange `#FF6B00`, others
  `rgba(6,182,212,.42)`; value above each bar, month label below.
- **Trip cost estimator** — card border flashes cyan when arrived at from the dashboard.
  Sub-line "Based on {nick} · 28.5 km/L · gasohol 95 at ฿37.50/L".
  One text input (inputMode decimal, min-height 50 px, Chakra Petch 700 18 px, digits+dot only),
  4 preset chips (Pattaya · 147 km / Khao Yai · 190 km / Hua Hin · 199 km / Commute · daily · 34 km),
  then a 3-up result row: FUEL NEEDED (L, 2 dp), EST. COST (฿, rounded, orange), REFUEL STOPS
  (`max(0, ceil(liters / tank) − 1)`, cyan, with "tank 13.5L" as the unit).
  Footer note: "Round trip 294 km ≈ ฿790 · adds 294 km to the odometer, pulling the next oil change
  294 km closer."
- **Fuel log** — section header + "＋ ADD ENTRY" (orange). Rows: 34 px orange-tint fuel tile,
  station, sub "28 Jul 2026 · 8.42 L · 6,800 km", right-aligned total (฿) and per-fill consumption
  computed from the odo delta (emerald when ≥ the bike average, else slate; "—" for the oldest row).

### TAB 5 — VAULT (ICE, documents, resale)
- **ICE card** — bg `#4C0519`, 1.5 px border `#F43F5E`, radius 20 px,
  shadow `0 0 0 1px rgba(244,63,94,.2), 0 14px 30px -14px rgba(244,63,94,.5)`.
  Header: 26 px rose alert tile, "ICE · EMERGENCY" + "ข้อมูลฉุกเฉิน · แสดงให้กู้ภัย", and a
  40 px solid-rose "FULL SCREEN" button. Body: 62 px blood-type tile ("O+", Chakra Petch 700 24 px)
  + allergies block ("Penicillin · Shellfish") + note ("Wears contact lenses · no other conditions").
  Contact rows (min-height 44 px content, radius 13 px): name, "relation · phone", and a
  `tel:` CALL button (min 70×44, solid `#F43F5E`, dark-rose label). Footer: insurer + policy number.
- **ICE full-screen** (own overlay, z 80) — solid `#4C0519`, scrollable. "IN CASE OF EMERGENCY"
  eyebrow (tracking .2em) + close button; rider name (Chakra Petch 700 30 px) and Thai name + plate;
  blood type on a white `#FFF1F2` card (Chakra Petch 700 40 px `#9F1239`) beside an allergies card;
  contacts as full-width white cards with a 48 px rose call tile; insurance/hospital/policy block;
  footer "Works offline · แสดงหน้านี้ให้เจ้าหน้าที่กู้ภัย 1669". Designed for maximum legibility by
  a stranger in daylight — do not soften the contrast.
- **Document vault** — one 64 px row per document: 42 px stripe tile + type icon, name,
  "thai name · หมดอายุ {Thai Buddhist-era date}", and a right-aligned countdown badge
  "22d LEFT" / "14d OVER". Thresholds: `<0` or `<30 days` rose, `<75` amber, else emerald; the row
  border turns rose/amber to match. Icons: tax = calendar, พ.ร.บ. = shield, voluntary = file,
  license = tag. Tapping opens the preview modal: scanned-document placeholder (186 px, "stored
  offline · 312 KB" chip — replace with the real stored image), an expiry block in the status color,
  and "SET RENEWAL REMINDER" (cyan) which closes the modal and toasts
  "Reminder set · 30 days before {doc} expires".
- **Resale passport CTA** — cyan-tint card, file icon, "GENERATE RESALE REPORT" + "Vehicle passport ·
  {n} verified services ready to share" → opens the passport sheet:
  eyebrow "MOTOCARE VEHICLE PASSPORT", bike + "2024 · plate · 7,047 km", an emerald
  "{n} SERVICES VERIFIED" banner ("Receipts photographed & timestamped · ประวัติครบ"), a 2×2 stat grid
  (odometer / avg consumption / maintenance spend / mods installed with one-line provenance each),
  the full service history list (green dot, job, "date · odo · shop", cost or "free"), a 74 px
  QR placeholder (`repeating-conic-gradient`) with the explanation "Buyer scans this code to open a
  read-only passport — service history, mods, and document validity, no personal data.
  ผู้ซื้อสแกนดูประวัติได้ทันที", and a solid-cyan "EXPORT PDF PASSPORT" button.
  In production, generate a real signed share link + QR and a server-rendered PDF.

---

## Interactions & Behavior

**Log Fuel sheet** (bottom sheet, radius 26 px top, enter `mcUp` translateY 22 px .3 s
cubic-bezier(.22,1,.36,1), scrim `rgba(2,6,15,.74)`):
1. Scan frame (120 px, dashed) with three states — idle "NO RECEIPT SCANNED" / "or type the numbers
   below" (slate); scanning "READING RECEIPT…" / "ocr · thai + latin" (orange, plus a 2 px orange
   scan line animating top 8 %→86 %, .9 s alternate); matched "RECEIPT MATCHED" /
   "PTT · 95 gasohol · 4 fields filled" (emerald).
2. "SCAN PUMP RECEIPT (OCR)" button → scanning for 1.5 s → fills litres 8.42, total ฿315.75,
   odometer = current + 247, station "PTT Station · Rama IX". Replace with real OCR
   (Thai + Latin numerals); keep the four extracted fields and the ability to correct them by hand.
3. Four inputs (litres, total ฿, odometer, station), each min-height 48 px.
4. Live "Calculated consumption" row: `(newOdo − lastLoggedOdo) / litres`, emerald if ≥ the stored
   average, else amber, "—" until valid.
5. Save validates all three numeric fields (toast "Fill litres, total and odometer first" if not),
   then: odometer = `max(current, entered)`, average km/L replaced with the computed value, log
   prepended, sheet closes, bars re-animate, toast
   "Fuel logged · odometer now 7,047 km · 29.3 km/L".
   Footer note is connectivity-aware: offline → "No signal? Entry is stored on device and syncs when
   you are back online."

**Record Service sheet** — part selector chips (all 5 consumables), odometer (prefilled with current),
cost ฿, shop/garage free text. Save sets that part's `lastOdo`/`lastDate`, bumps the odometer if
higher, prepends a service record (shop defaults to "Self-serviced at home"), re-animates, toasts
"{part} logged at 7,047 km · counter reset".

**Voice entry modal** — centered card. Mic in a 64 px disc; while listening a 2 px cyan halo ring
scales 0.7→2.1 and fades (1.6 s infinite) and the mic pulses (scale 1→1.14, 1.1 s). Tapping
"START SPEAKING" types the Thai phrase "เปลี่ยนน้ำมันเครื่อง Motul 7100 ราคา 890 บาท ที่ 6,800 กม."
one character every 42 ms; on completion the title becomes "PARSED", an emerald block lists the
parsed fields (Part / Odometer / Cost / Shop) and the CTA becomes "SAVE ENTRY", which writes the same
mutation as Record Service. Replace the fake transcript with Web Speech API (`th-TH`) plus an
extraction step; keep the parsed-fields confirmation before writing.

**Add New Bike sheet** — brand chips (Honda, Yamaha, Zontes, Vespa, Kawasaki), model, nickname, year,
odometer; an info row promises auto-filled Thailand-market specs. Save requires a model name, then
creates the bike with default intervals (oil 4,000 / brakes 14,000 / chain 800 / tyres 18,000 /
air filter 9,000 km), makes it active, jumps to GARAGE, and toasts "{nick} added · Thai factory specs applied".

**Toast** — single slot, bottom 78 px, bg `#0B1120`, emerald border, check icon, auto-dismiss 3 s,
enter `mcIn`. Only one at a time; a new toast replaces the old.

**Animations**
| Name | Definition | Used by |
|---|---|---|
| `mcIn` | opacity 0→1, translateY 10px→0, .22–.26 s ease-out | tab content, dropdown, modals, toast |
| `mcUp` | translateY 22px→0, .3–.32 s cubic-bezier(.22,1,.36,1) | bottom sheets |
| `mcFade` | opacity 0→1, .18 s ease-out | scrims, full-screen ICE |
| `mcPulse` | scale 1→1.14 + opacity .5, 1.1 s infinite | listening mic |
| `mcHalo` | scale .7→2.1, opacity .55→0, 1.6 s infinite | listening ring |
| `mcScan` | top 8 %→86 %, .9 s alternate infinite | OCR scan line |
| `mcBlink` | opacity 1→.25, 2.4 s infinite | sync dot |
| bar / ring | width or stroke-dasharray, 1 s cubic-bezier(.22,1,.36,1) | wear bars, rings, stacked bar, monthly bars |

Wear bars/rings animate **from zero** on mount and on every data-changing event (bike switch,
profile change, service or fuel save, bike added) — a 90 ms zero frame then the target value.

**Touch targets** — every primary action is ≥ 44 px, most 48–58 px (glove use). Text never below
8.5 px for all-caps micro-labels and 9.5 px for sentence copy; body copy 10–13 px at 400 px width.

**Offline/PWA** — all data is local-first; the header badge reflects sync state and queued count.
Sheets must work with no network; the document vault and ICE screen must render from cache.

## State Management
Prototype state (single component) maps to these real concerns:

| State | Type | Notes |
|---|---|---|
| `tab` | `'dash' \| 'maint' \| 'mods' \| 'cost' \| 'vault'` | bottom nav; becomes routes |
| `bikes` | `Bike[]` | the garage; server-synced collection |
| `activeId` | `string` | selected bike, persist across sessions |
| `switcher`, `specs` | boolean | header dropdown, specs drawer |
| `profile` | `'urban' \| 'mixed' \| 'touring'` | per bike in production, not global |
| `pipeline` | `'wishlist' \| 'ordered' \| 'installed'` | mods segmented control |
| `modal` | `null \| 'fuel' \| 'log' \| 'voice' \| 'doc' \| 'ice' \| 'resale' \| 'bike'` | one overlay at a time |
| `docId` | `string` | which document the preview shows |
| `mounted` | boolean | animation gate (0 → target) |
| `online` | boolean | sync badge; real connectivity |
| `toast` | `string \| null` | 3 s auto-dismiss |
| `tripKm` | string | trip estimator input |
| `f`, `lg`, `nb` | form objects | fuel / service / add-bike drafts |
| `v` | `{listening, text, done}` | voice session |

**Bike model**
```ts
type Bike = {
  id: string; nick: string; brand: string; model: string; year: number; plate: string;
  odo: number; kmpl: number; tank: number; drive: 'Chain' | 'Belt'; photoSize: string;
  specs: [string, string][];                     // 6 factory rows
  parts: { key:'oil'|'brake'|'chain'|'tyre'|'air'; label:string; thai:string;
           interval:number; lastOdo:number; lastDate:string; prof:boolean }[];
  mods:  { id:string; name:string; cat:'HANDLING'|'STYLE'|'PERFORMANCE'|'PROTECTION'|'UTILITY';
           price:number; stage:'wishlist'|'ordered'|'installed'; stock:string;
           trigger:string; meta:string }[];
  fuelLogs: { date:string; station:string; liters:number; thb:number; odo:number }[];
  monthly: [string, number][];                   // 6 months of ฿ spend
  services: { date:string; odo:number; what:string; shop:string; cost:number }[];
  docs: { id:'tax'|'prb'|'vol'|'lic'; name:string; thai:string; expiry:string; issuer:string }[];
};
```

**Predictive wear (the core formula)**
```
factor   = {urban: 0.8, mixed: 1.0, touring: 1.15}[profile]
interval = round(part.interval × (part.prof ? factor : 1))
due      = part.lastOdo + interval
rem      = due - bike.odo
pct      = clamp(rem / interval × 100, 0, 100)
status   = rem <= 0                                            -> 'urgent' (OVERDUE)
         : pct < 14 || (part.interval > 2000 && rem < 400)      -> 'urgent'
         : pct < 36                                             -> 'soon'
         : 'good'
healthScore = round(mean(pct of all parts))          // <35 urgent, <55 soon, else good
```
Trip: `liters = km / kmpl`, `cost = liters × fuelPrice`, `stops = max(0, ceil(liters / tank) − 1)`.
Cost per km: `fuelPrice / kmpl`. Per-fill consumption: `(odo − previousOdo) / liters`.
Document countdown: `round((expiry − now) / 86 400 000)` days; Thai dates use Buddhist era
(`year + 543`) with short Thai month names.

**Configurable inputs** exposed as props in the prototype (make them settings/config in the app):
`fuelPricePerLitre` (default 37.5 ฿/L — should come from a live price feed or user setting),
`ridingProfile` (default `urban`), `bilingualThai` (default true).

## Design Tokens
**Color**
| Token | Hex | Tailwind |
|---|---|---|
| bg / page | `#05070C` | — (below slate-950) |
| bg / app | `#0F172A` | slate-900 |
| bg / sunken | `#0B1120` | — (slate-950-ish) |
| surface | `#1E293B` | slate-800 |
| border | `#334155` / `rgba(51,65,85,.5–.7)` | slate-700 |
| border subtle | `#475569` | slate-600 |
| text primary | `#F8FAFC` / `#F1F5F9` | slate-50 / slate-100 |
| text secondary | `#E2E8F0` | slate-200 |
| text muted | `#94A3B8` | slate-400 |
| text faint | `#64748B` / `#475569` | slate-500 / slate-600 |
| accent primary | `#FF6B00`, hover/label `#FF8A33` | orange-500-ish |
| accent secondary | `#06B6D4`, light `#22D3EE`, lighter `#67E8F9` | cyan-500/400/300 |
| status good | `#10B981`, text `#6EE7B7`, tint `rgba(16,185,129,.09–.12)` | emerald-500/300 |
| status soon | `#F59E0B`, text `#FBBF24`/`#FCD34D`, tint `rgba(245,158,11,.09–.12)` | amber-500/400/300 |
| status urgent | `#F43F5E`, tint `rgba(244,63,94,.11–.12)` | rose-500 |
| ICE surface | `#4C0519`, card `#FFF1F2`, ink `#9F1239`/`#881337`, muted `#FDA4AF`/`#FECDD3` | rose-950/50/800/700/300/200 |
| category violet | `#C4B5FD` on `rgba(139,92,246,.14)` | violet-300 |
| scrim | `rgba(2,6,15,.66 / .74 / .8 / .82)` | — |

**Typography** — two families, both with Thai coverage:
`Chakra Petch` 500/600/700 for headings, numerals, all-caps labels and buttons;
`IBM Plex Sans Thai` 400/500/600 for body, Thai copy and list rows.
Scale actually used (px): 40 / 32 / 30 / 26 / 24 / 22 / 21 / 20 / 19 / 18 / 17 / 16 / 15 / 14 /
13.5 / 13 / 12.5 / 12 / 11.5 / 11 / 10.5 / 10 / 9.5 / 9 / 8.5 / 8.
Tracking: `.02em` small caps, `.06–.14em` micro-labels, `.2em` eyebrows, `-.01/-.02em` on the
largest numerals. All figures use `font-variant-numeric: tabular-nums`.
Monospace (`ui-monospace, Menlo`) only for placeholder/diagnostic strings.

**Spacing** — 4 px base. Gaps used: 3/4/5/6/7/8/9/10/11/12/13/14/16 px. Card padding 11–14 px,
screen padding 14 px, sheet padding 16 px (22 px bottom).

**Radius** — 5/6/7/8/9/10/11/12/13/14/15/16/18/20/22/24/26 px, `99px` pills, 44 px device frame.

**Shadow** —
`0 12px 26px -12px rgba(255,107,0,.9)` (primary button), same with cyan for the passport CTA;
`0 18px 34px -14px rgba(0,0,0,.9)` (toast); `0 26px 50px -12px rgba(0,0,0,.8)` (dropdown);
`0 14px 30px -14px rgba(244,63,94,.5)` (ICE card).

## Assets
- **Icons** — 28 hand-drawn 24×24 stroke glyphs in an inline SVG sprite (stroke-width 1.8–2.1,
  round caps/joins, `currentColor`). Swap for `lucide-react`:
  gauge→`Gauge`, cog→`Settings`, box→`Package`, chart→`BarChart3`, shield→`ShieldCheck`,
  drop→`Droplet`, fuel→`Fuel`, disc→`Disc3`, chain→`Link2`, tyre→`CircleDot`, cal→`CalendarDays`,
  file→`FileText`, tag→`Tag`, wallet→`Wallet`, nav→`Navigation`, mic→`Mic`, scan→`ScanLine`,
  cam→`Camera`, alert→`AlertTriangle`, check→`Check`, clock→`Clock`, bolt→`Zap`, phone→`Smartphone`,
  dl→`Download`, plus→`Plus`, x→`X`, chev→`ChevronDown`, chevr→`ChevronRight`.
- **Photography** — none supplied. Bike covers, part thumbnails and scanned documents are
  diagonal-stripe placeholders with monospace captions; wire them to the real image picker /
  document store. Bike cover: 400×176 minimum, `object-fit: cover`. Part thumb: 58×58.
  Document scan: 4:3-ish, 186 px tall preview.
- **Fonts** — Google Fonts: Chakra Petch (500/600/700), IBM Plex Sans Thai (400/500/600). Self-host
  for offline/PWA use.
- **Mock content** — 3 bikes (Zontes 368G "Gray Shadow", Honda Wave 125i "Daily Wave",
  Vespa Sprint S 150 "Bianca") with plates, Thai shop names, PTT/Bangchak/PT/Susco/Shell/Caltex
  stations, and realistic THB prices. All copy in the prototype is final-quality; reuse it for
  demos, replace with user data in production.

## Files
- `MotoCare.dc.html` — the complete prototype (all 5 tabs, 7 overlays, mock data, wear/trip math).
  Open it in a browser; everything is interactive. Read the logic class at the bottom of the file for
  the exact data shapes and formulas, and the markup above it for exact styles per element.
- `BUILD_PLAN.md` — phased execution order with acceptance criteria per phase, plus the list of
  known gaps to ask the product owner about before inventing anything.
- `seed-data.json` — the prototype's mock data (3 bikes with parts/mods/fuel logs/services/docs,
  rider ICE record, riding profiles, config). Drop-in fixture for development and tests.
- `screens/` — 19 reference captures at the 400 px design width:
  `01–02` garage dashboard (top/bottom), `03` specs drawer, `04` garage switcher,
  `05–07` smart maintenance, `08–09` mods planner, `10–12` costs & trip estimator,
  `13–14` vault, `15` resale passport, `16` ICE full screen, `17` log-fuel sheet after OCR,
  `18` voice entry parsed, `19` document preview.

## Suggested first prompt for Claude Code
> Read `design_handoff_motocare/README.md` and `BUILD_PLAN.md`. Recreate the MotoCare design in this
> codebase using our existing stack and patterns, following the build plan phase by phase. Use
> `seed-data.json` as the development fixture and `screens/` as the visual reference. Port the wear,
> trip and expiry formulas exactly, and stop to ask before implementing anything in the
> "Deliberate gaps" list.
