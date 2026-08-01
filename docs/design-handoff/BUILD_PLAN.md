# Build plan — MotoCare

Read `README.md` first (full visual + behavioral spec). This file is the execution order,
with acceptance criteria per step. Screens referenced as `screens/NN-*.png`.

Assumed target: React 18 + TypeScript + Tailwind CSS + `lucide-react`, PWA (vite-plugin-pwa or
Next.js App Router + next-pwa). If the repo already has a stack, use it and ignore this assumption —
but keep the phase order.

---

## Phase 0 — Foundation
1. Tailwind config: extend colors with the token table in README (`ink`, `surface`, `sunken`,
   `accent` = `#FF6B00`, `accent2` = `#06B6D4`; statuses map to emerald/amber/rose 500).
   Fonts: `display: ['Chakra Petch']`, `sans: ['IBM Plex Sans Thai']`; self-host both.
2. `AppShell` — 100dvh column, `max-w-md mx-auto`, header (sticky) / scroll area / bottom nav.
   Safe-area insets on the nav (`env(safe-area-inset-bottom)`).
3. Keyframes in `globals.css`: `mcIn`, `mcUp`, `mcFade`, `mcPulse`, `mcHalo`, `mcScan`, `mcBlink`
   (definitions in README → Animations).
4. Global rule: every interactive element `min-h-[44px]`, primary actions `min-h-[48px]`.

**Done when** the empty shell scrolls, the nav switches 5 routes, and nothing is below 44 px.

## Phase 1 — Data layer
5. Types from README → State Management (`Bike`, `Part`, `Mod`, `FuelLog`, `Service`, `Doc`, `Rider`).
6. `seed-data.json` (in this bundle) loads into local state / IndexedDB. Local-first:
   all writes go to the local store, a queue tracks unsynced mutations, the header badge shows
   `queued.length`.
7. Pure functions in `lib/wear.ts` — port these verbatim (README → Predictive wear):
   `wear(part, bike, profile)`, `healthScore(bike, profile)`, `tripEstimate(km, bike, price)`,
   `docCountdown(iso)`, `thaiDate(iso)` (Buddhist era + short Thai months),
   `consumption(odo, prevOdo, liters)`.
8. Unit-test the formulas: Zontes at 6,800 km on `urban` must yield oil = 1,200 km remaining /
   30 % / SERVICE SOON; chain = 290 km / URGENT; health score 45.

**Done when** the tests above pass and switching profile changes every number.

## Phase 2 — Header + garage (screens 01–04)
9. Garage switcher (dropdown, active row, add-bike CTA), sync badge (2 states), spec chips,
   factory-specs drawer.
10. Bike switch resets the mods pipeline, re-runs bar/ring animations, and toasts.
11. Toast component: single slot, 3 s, bottom 78 px.

**Done when** all three bikes swap every number on every tab.

## Phase 3 — Dashboard (screens 01–02)
12. Hero card with real cover photo + client-side compression (show the resulting KB in the badge),
    odometer, health score.
13. Ring component (SVG, `stroke-dasharray`, animate from 0). Health grid 2×2.
14. Quick action group (3 buttons) + recent activity feed (fuel logs ∪ services, newest 4).

## Phase 4 — Smart maintenance (screens 05–07)
15. Score card + riding-profile chips (persist per bike).
16. Wear card list with status badges, animated bars, "LOG REPLACEMENT".
17. Record Service sheet — writes `lastOdo`/`lastDate`, prepends a service, bumps odometer, toasts.

**Done when** logging a replacement resets that part's counter and re-animates.

## Phase 5 — Fuel + costs (screens 10–12, 17)
18. Log Fuel sheet: scan frame 3 states, real OCR (Thai + Latin numerals; Tesseract/ML Kit/
    cloud vision — must be correctable by hand), 4 fields, live consumption row, validation, save.
19. Stat grid, monthly bars, fuel log rows with per-fill consumption.
20. Trip estimator: input + 4 presets + 3 results + round-trip note. Arriving from the dashboard
    flashes the card border cyan for 1.4 s.

**Done when** a saved fill updates odometer, average km/L, log list, activity feed, and all wear bars.

## Phase 6 — Mods planner (screens 08–09)
21. Financial overview + 3-segment stacked bar; pipeline segmented control with counts.
22. Part cards incl. the two distinguishing rows: maintenance-trigger warning (conditional) and
    ORIGINAL STOCK PART storage location (always). Stage advance rewrites the meta line + toasts.
23. Add/edit part form (not in the prototype — design it from the card's own fields; ask before
    inventing new fields).

## Phase 7 — Vault (screens 13–16, 19)
24. ICE card + full-screen ICE view (`tel:` links, offline-first, max contrast). Treat as a
    safety-critical view: no truncation, no lazy-loaded fonts, works with no network.
25. Document vault with expiry countdowns (rose <30 d, amber <75 d, emerald else), preview modal
    with the stored scan, "SET RENEWAL REMINDER" → real local notification / calendar event.
26. Resale passport: sheet content, then real artifacts — signed read-only share link + QR + PDF export.

## Phase 8 — Voice + PWA (screen 18)
27. Voice entry: Web Speech API `th-TH`, streaming transcript, extraction to
    {part, odometer, cost, shop}, confirmation block before writing. Keep the halo/pulse motion.
28. PWA: manifest (dark theme `#0F172A`, maskable icon), service worker precaching the shell +
    fonts + vault documents, offline write queue flush on reconnect, install prompt.
29. Accessibility pass: contrast (all text on `#1E293B` ≥ 4.5:1 — the 8.5 px micro-labels are
    decorative duplicates, keep them ≥ `#94A3B8`), focus rings, `aria-live` on the toast,
    reduced-motion fallbacks for the pulse/halo/scan loops.

---

## Deliberate gaps (ask the product owner, do not invent)
- Editing/deleting a fuel log or service record.
- Multi-user / cloud account model; the prototype is single-rider local-first.
- Where fuel price comes from (hard-coded ฿37.50 in the prototype; needs a feed or a setting).
- Part sourcing links / price tracking for the wishlist.
- Notification permissions + reminder scheduling policy.
- Insurance/tax renewal deep links to Thai providers.

## Fidelity checklist (compare against `screens/`)
- [ ] Orange is only used for primary actions, active nav, and the latest data point.
- [ ] Status colors never appear except as wear/expiry state.
- [ ] Every number is `tabular-nums`; every all-caps label uses Chakra Petch with tracking.
- [ ] Wear bars and rings animate from zero on mount and after every mutation.
- [ ] Thai copy is present where the prototype has it (ป้ายวงกลม, พ.ร.บ., ประกันชั้น 1, ใบขับขี่,
      profile chip subtitles, ICE labels, sheet subtitles).
- [ ] No element under 44 px is tappable.
