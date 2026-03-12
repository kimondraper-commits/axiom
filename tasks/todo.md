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

## Phase 9: Tier 4 (Documentation Only)
- [ ] Document planned integrations for presentation: DBYD, NSWLRS, Ausgrid/Sydney Water, AURIN, Nearmap, CoreLogic, G-NAF

## Environment Variables Needed
```
SILO_API_KEY=           # Free from longpaddock.qld.gov.au
NSW_EPLANNING_API_KEY=  # Free from api.nsw.gov.au
TFNSW_API_KEY=          # Free from opendata.transport.nsw.gov.au
```
