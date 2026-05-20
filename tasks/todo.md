# AXIOM Implementation Guide — Progress Tracker

## Completed (Prior Sessions)

### Phase 1: Foundation
- [x] Centralized reference-data constants (32 LGAs, all economic/env constants)
- [x] 6 calculator files updated to use reference-data imports
- [x] 14 map layers seeded in Prisma (cadastre, LEP, bushfire, heritage, flood, etc.)
- [x] Parcels API expanded (Heritage/Bushfire/Flood/AcidSulfate endpoints)
- [x] Create-project form wired to GIS

### Phase 2: Live APIs
- [x] Redis caching layer
- [x] 7 API wrappers (RBA, ABS, SILO, NSW Air, ePlanning, BioNet, TfNSW)
- [x] Analytics route with ABS live data + fallbacks

### Phase 3: Core Data Feeds
- [x] 3 API routes (ePlanning, BioNet, TfNSW)
- [x] Train stations layer, compliance auto-flagging

### Phase 4: Intelligence
- [x] AI system prompt for NSW EP&A Act

### Phase 5: Design System Migration
- [x] Dark -> Light migration with backward-compat aliases

---

## Phase 6: Implementation Guide — Tier 1

### #1 — NSW Map Layers [MOSTLY DONE]
- [x] 14 layers already seeded (covers all 8 from guide + extras)
- [ ] Verify all layers render correctly in browser
- [ ] Confirm layer panel categories display properly

### #2 — Project Readiness Scorecard [DONE]
- [x] Create page: `src/app/(dashboard)/readiness/page.tsx`
- [x] Build component: `src/components/readiness/readiness-scorecard.tsx`
- [x] 7 weighted criteria with dropdowns (Scope, Design, Cost, Delivery, BCR, Risk, Community)
- [x] Circular gauge with traffic light (RED 0-39 / AMBER 40-69 / GREEN 70-100)
- [x] Individual criteria breakdown bars
- [x] Add "Readiness" to sidebar nav
- [ ] Verify: all-low = 0% RED, all-high = 100% GREEN, weighted math correct

### #3 — Flood & Bushfire Layers [ALREADY DONE]
- [x] Flood Planning Areas tile layer already seeded (`nsw-flood-planning`)
- [x] Bushfire Prone Land tile layer already seeded (`nsw-bushfire`)
- [x] Both at 0.6 opacity, toggleable in layer panel under Environmental category
- [x] WMS versions not needed — tile layers provide equivalent coverage

### #5 — Community Impact Dashboard [DONE]
- [x] Create page: `src/app/(dashboard)/community-impact/page.tsx`
- [x] Build component: `src/components/community-impact/impact-dashboard.tsx`
- [x] Input: Number of Dwellings + LGA dropdown (reuse constants.ts)
- [x] 6 impact cards:
  - [x] Population Impact (dwellings x LGA household size)
  - [x] School Capacity (sample data, capacity bars, color-coded)
  - [x] Health Facilities (sample data, nearest hospitals)
  - [x] Parks & Open Space (benchmark: 2.83 ha per 1,000 residents)
  - [x] Transport Access (score 0-100, nearest stations)
  - [x] Traffic Impact (dwellings x 3.4 daily trips)
- [x] Add "Community Impact" to sidebar nav
- [ ] Verify: calculations update in real-time on input change

### #4 — ABS Census + DPE Projections [DONE]
- [x] constants.ts already has 32 LGA household sizes + growth rates
- [x] Calculators already use LGA-specific data via getDefaults()
- [ ] Verify LGA dropdown works in population calculator

---

## Phase 7: Implementation Guide — Tier 2

### #6 — Climate & Disaster Risk Page [DONE]
- [x] Create page: `src/app/(dashboard)/climate-risk/page.tsx`
- [x] Component: `src/components/climate-risk/climate-risk-panel.tsx`
- [x] Summary table of 6 risk layers with severity badges
- [x] Detailed descriptions with NSW legislation references
- [x] Link to GIS Maps for map-based viewing
- [x] Add "Climate Risk" to sidebar nav
- [ ] Composite risk indicator on parcel click (future enhancement)

### #7 — ePlanning DA UI [DONE]
- [x] Created new page: `src/app/(dashboard)/live-das/page.tsx`
- [x] Built component: `src/components/live-das/da-table.tsx`
- [x] Table: DA Number, Address, Type, Status, Council
- [x] Council dropdown with 15 LGAs, search button
- [x] Status badges with color coding
- [x] Connected to existing `data-sources/nsw-eplanning.ts` (no API key needed — POST-based tracker)
- [x] Added "Live DAs" to sidebar nav

### #8 — SILO Rainfall -> Env Calculator [DONE]
- [x] Add lat/lng input to Environmental Calculator
- [x] Created API route: `src/app/api/data-sources/silo/route.ts`
- [x] Fetch from existing `data-sources/silo.ts` via new API route
- [x] Replace hardcoded 700mm DEFAULT_RAINFALL_MM with live data on fetch
- [x] Loading indicator + fallback to 700mm on error
- [x] Attribution text

### #9 — RBA Stats -> Econ Calculator [DONE]
- [x] Created API route: `src/app/api/data-sources/rba/route.ts`
- [x] Fetch CPI annual change from existing `data-sources/rba.ts`
- [x] Show as "Cost Escalation Rate (CPI)" with live value + CPI index
- [x] "LIVE DATA" badge
- [x] Attribution text
- [x] Auto-fetches on component mount, graceful error fallback

### #10 — TfNSW Transit on Map [ALREADY DONE]
- [x] Train stations layer already seeded (`nsw-train-stations`) as GeoJSON circles
- [x] 39 major stations with coordinates from TfNSW
- [x] Toggleable under "Transport" category in layer panel
- [x] Sustainability calculator uses distance-based transit scoring (manual input)

---

## Phase 8: Implementation Guide — Tier 3

### #11 — Subsurface Asset Layer [DONE]
- [x] Created page + component: `src/app/(dashboard)/subsurface/page.tsx`
- [x] 9 sample subsurface features (contamination, geology, bores, drainage)
- [x] Risk level indicator (HIGH/MODERATE/LOW)
- [x] Feature breakdown by type with filter buttons
- [x] Status badges (Active/Managed/Remediated)
- [x] Add "Subsurface" to sidebar nav

### #12 — Property Acquisition Analyser [DONE]
- [x] Created page + component: `src/app/(dashboard)/acquisitions/page.tsx`
- [x] 23 sample parcels for Parramatta corridor
- [x] Adjustable buffer width and property count
- [x] Summary cards: count, land value, acquisition cost (x1.15), timeline
- [x] Full property table with Lot/DP, zoning, values, heritage flags
- [x] Add "Acquisitions" to sidebar nav

### #13 — BioNet Biodiversity Screening [DONE]
- [x] Created page + component: `src/app/(dashboard)/biodiversity/page.tsx`
- [x] Lat/lng/radius search connected to existing BioNet API route
- [x] "Biodiversity Assessment Required" / "No Threatened Species" banner
- [x] Species table with conservation status badges
- [x] Add "Biodiversity" to sidebar nav

### #14 — Community Submissions Tracker [DONE]
- [x] Created page + component: `src/app/(dashboard)/submissions/page.tsx`
- [x] 6 sample submissions with status/sentiment tracking
- [x] Add submission form (submitter, category, sentiment, summary)
- [x] Analytics: total count, sentiment breakdown, category bar chart
- [x] Myth-buster module with 2 sample myths
- [x] Add "Submissions" to sidebar nav

---

## Phase 9: QA, Polish & AI Context Injection

### Pre-work: Fix TS errors [DONE]
- [x] `src/lib/auth.ts:40` — adapter type mismatch → cast with `as any`
- [x] `src/app/api/maps/layers/route.ts:39` — Prisma JsonNull → cast `sourceConfig`/`layerConfig` as any
- [x] All API routes → `export const dynamic = "force-dynamic"` for Next.js 16 build compat
- [x] Login page → Suspense boundary for `useSearchParams()`
- [x] `npx tsc --noEmit` — 0 errors
- [x] `npm run build` — passes clean

### 9A — Error Boundaries & Loading States [DONE]
- [x] Global error boundary: `src/app/(dashboard)/error.tsx`
- [x] Reusable skeleton components: `src/components/ui/skeleton.tsx`
- [x] 15 page-level `loading.tsx` files with appropriate skeletons:
  - overview, maps, analytics, projects, assistant, calculators
  - acquisitions, live-das, submissions, biodiversity
  - climate-risk, community-impact, import, readiness, subsurface

### 9B — AI Context Injection [DONE — was already implemented]
- [x] `/api/ai/chat/route.ts` already fetches project context + GIS constraints
- [x] `buildSystemPrompt()` already injects zone, height, FSR, heritage, hazards
- [x] Enhanced: now includes proposal metrics (dwellings, GFA, height, etc.)
- [x] Enhanced: now includes compliance flags with notes from GIS

### 9C — Parcel Query Enhancement [DONE — was already implemented]
- [x] `/api/maps/parcels` already returns: HOB, FSR, heritage, bushfire, flood, acid sulfate

### 9D — Compliance Auto-Flagging [DONE]
- [x] Created `src/lib/compliance-check.ts` with `isRisk()` smart filtering
- [x] Wired into `create-project-form.tsx` via `buildComplianceItems()`
- [x] Filters "Not applicable" / "N/A" / "No data" values (no longer false-flags)
- [x] Also enriches non-flagged items with GIS notes (zone, height, FSR)

## Future: Tier 4 (Documentation Only)
- [ ] Document planned integrations for presentation: DBYD, NSWLRS, Ausgrid/Sydney Water, AURIN, Nearmap, CoreLogic, G-NAF

## Environment Variables Needed
```
SILO_API_KEY=           # Free from longpaddock.qld.gov.au
NSW_EPLANNING_API_KEY=  # Free from api.nsw.gov.au
TFNSW_API_KEY=          # Free from opendata.transport.nsw.gov.au
```

---

# 🚀 ACTIVE SPRINT: Mosaic Integration (started 2026-04-07)

> **Application submitted to Mecone:** 2026-04-06. Velocity = MAX.
> **Strategy doc:** `tasks/mosaic-integration-plan.md`
> **PDF brief:** `~/Desktop/AXIOM-Mosaic-Plan.pdf`

## Locked decisions
- ✅ Sprint order: Phase A → B → C → D
- ✅ NSW only
- ✅ Workbench BYO datasets integrated into existing import wizard
- ✅ AIM v1: 5 sieve rules (zone, height, FSR, lot size, station distance)
- ✅ Site PDF reports: ALL sections
- ✅ No Nearmap/MetroMap → use OSM/Mapbox satellite tiles
- ✅ AIM saved searches: per-user

## PHASE A — Map Power-Up ✅ SHIPPED 2026-04-07

### A.0 — Recon ✅
- [x] Read current `/maps` page implementation
- [x] Read `MapContainer` and `LayerPanel` components
- [x] Identify reusable pieces vs what needs replacing

### A.1 — Vertical icon rail refactor ✅
- [x] `MapToolRail` component (`map-tool-rail.tsx`)
- [x] Tools: Layers · 3D · Draw · Measure · Isochrone · Basemap · Screenshot · Fullscreen
- [x] Tooltip on hover, active state styling

### A.2 — Pill-toggle layer panel redesign ✅
- [x] New `LayersPanel` (`panel-layers.tsx`) with pill-toggle rows
- [x] Status dot · label · info icon hover · 24px row
- [x] Grouped by category (Cadastre, Planning, Transport, Environmental, Housing)
- [x] Search input at top
- [x] Active layer count badge

### A.3 — 3D mode + 3D buildings ✅
- [x] Pitch + bearing controls (eased to 60°/-20° on toggle)
- [x] Mapbox `fill-extrusion` 3D buildings layer
- [x] 3D toggle button in tool rail

### A.4 — Drawing tools ✅
- [x] Installed `@mapbox/mapbox-gl-draw`
- [x] `DrawControl` wrapper component using `useControl`
- [x] Custom AXIOM-themed draw styles (green dashed lines, transparent fills)
- [x] `DrawPanel` with Line + Polygon modes
- [x] Feature counter, GeoJSON export, clear all
- [x] (Circle dropped — not built into mapbox-gl-draw, would need plugin)

### A.5 — Measurement tool ✅
- [x] Distance + area modes via Turf.js
- [x] `MeasurePanel` with mode selector and live result card
- [x] Auto-formatted units (m → km, m² → ha → km²)
- [x] Click vertices, real-time calculation

### A.6 — Isochrone tool ✅
- [x] Mapbox Isochrone API integration
- [x] `IsochronePanel` with mode selector (walk/cycle/drive)
- [x] Time presets (5, 10, 15 min, or 5/10/15 concentric)
- [x] Click map to set origin → green marker
- [x] Concentric polygons rendered with graduated green fills

### A.7 — Basemap selector ✅
- [x] `BasemapPanel` with 5 styles: Dark · Streets · Satellite · Light · Outdoors
- [x] Visual previews with gradient thumbnails
- [x] Smooth swap

### A.8 — Verify Phase A ✅
- [x] `npx tsc --noEmit` clean
- [x] Dev server compiles `/maps` in 1.3s
- [x] HTTP 200 response
- [ ] Manual test every tool in browser (← waiting on Kimon)
- [ ] Before/after screenshots

### Files added in Phase A
- `src/components/maps/icons.tsx` (15 inline SVG icons)
- `src/components/maps/slide-over-panel.tsx` (reusable panel wrapper)
- `src/components/maps/map-tool-rail.tsx` (vertical icon rail)
- `src/components/maps/panel-layers.tsx` (new layers panel)
- `src/components/maps/panel-basemap.tsx` (basemap selector)
- `src/components/maps/panel-draw.tsx` (drawing tool panel)
- `src/components/maps/panel-measure.tsx` (measurement panel)
- `src/components/maps/panel-isochrone.tsx` (isochrone panel)
- `src/components/maps/draw-control.tsx` (mapbox-gl-draw wrapper)
- `src/components/maps/map-container.tsx` (REFACTORED orchestrator, ~600 lines)

## PHASE B — AIM Site Finder ✅ SHIPPED 2026-04-12

- [x] B.1 ArcGIS query engine (`lib/arcgis-query.ts`) — queries EPI sublayers with WHERE + bbox
- [x] B.2 Station distance filter (`lib/aim/station-filter.ts`) — turf.js proximity to 270 stations
- [x] B.3 CSV export (`lib/aim/csv-export.ts`) — GeoJSON → CSV via papaparse
- [x] B.4 AIM search API (`/api/aim/search`) — POST, accepts bbox + rules, queries ArcGIS in parallel
- [x] B.5 Saved searches API (`/api/aim/saved`) — GET/DELETE per-user
- [x] B.6 Prisma `AimSearch` + `UserDataset` models (created via SQL + Prisma generate)
- [x] B.7 `/aim` page with split view (rules left, map right)
- [x] B.8 AIM Finder component — zone multi-select, height/FSR/distance filters, result count, CSV export, save/load
- [x] B.9 Sidebar nav updated (AIM + planned Workbench)
- [x] B.10 Build verified — HTTP 200 in 600ms

## PHASE C — Data & Reports ✅ SHIPPED 2026-04-12

- [x] C.1 Property Valuations API (`/api/maps/valuations`) — SIX Maps land values via identify
- [x] C.2 KML Parser (`lib/import/parsers-kml.ts`) — KML→GeoJSON via @tmcw/togeojson
- [x] C.2 Workbench page + panel + datasets API — upload KML/GeoJSON, save to DB, render on map
- [x] C.2 UserDataset Prisma model + API CRUD (`/api/datasets`)
- [x] C.3 Site PDF Report (`lib/reports/site-report.tsx` + `/api/reports/site`) — @react-pdf/renderer
- [x] C.4 DA Snapshot PDF (`lib/reports/da-snapshot.tsx` + `/api/reports/da-snapshot`)
- [x] C.5 TSC clean, Workbench HTTP 200 in 3.3s

## PHASE D — Polish ✅ SHIPPED 2026-04-12

- [x] Inline "NEW FEATURE" callout card in layers panel (links to /aim)
- [x] `EmptyState` reusable component (`components/ui/empty-state.tsx`)
- [x] `ProGateModal` component (`components/ui/pro-gate-modal.tsx`) — Radix Dialog, AXIOM Pro branding
- [ ] Final demo recording (Loom) — waiting on Kimon
