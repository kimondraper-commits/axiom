# AXIOM Data Integration Plan

## Executive Summary

This document maps **40+ real data sources** to specific AXIOM features, prioritised by impact and integration effort. AXIOM already integrates 2 NSW ArcGIS services (Cadastre + Planning zones). The opportunity is to replace hardcoded demo data with live NSW government feeds across all modules.

---

## Current State

| AXIOM Module | Current Data Source | Status |
|---|---|---|
| Map layers | NSW SIX Maps Cadastre + Planning Portal tiles | Live (2 layers) |
| Parcel queries | NSW Cadastre + Planning identify endpoints | Live |
| Population calculator | Hardcoded: household size 2.53, growth 1.5% | Static |
| Economic calculator | Hardcoded: 9 FTE/$1M, $18K/person retail, $95K salary | Static |
| Environmental calculator | Hardcoded: 4.5 tCO2e/dw, 700mm rainfall | Static |
| Sustainability calculator | Formula-based, no external data | Static |
| Analytics dashboard | Demo data generators (fake permits, zoning, population) | Mock |
| AI Assistant | Generic planning system prompt | No context |
| Import system | Manual CSV/XLSX upload only | Manual |

---

## TIER 1 -- Immediate Impact (Free, No/Low Auth, Direct Integration)

### 1.1 Add 8 Map Layers (Zero code changes -- just seed data)

These all follow the exact same pattern as your existing layers. Add to `prisma/seed.ts`:

| Layer | Tile URL | Category |
|---|---|---|
| Bushfire Prone Land | `mapprod3.environment.nsw.gov.au/.../Bushfire_Prone_Land/MapServer/tile/{z}/{y}/{x}` | Hazards |
| Heritage | `mapprod3.environment.nsw.gov.au/.../EPI_Heritage/MapServer/tile/{z}/{y}/{x}` | Heritage |
| Acid Sulfate Soils | `mapprod3.environment.nsw.gov.au/.../EP_AcidSulfateSoils/MapServer/tile/{z}/{y}/{x}` | Hazards |
| Coastal Management | `mapprod3.environment.nsw.gov.au/.../EP_Coastal/MapServer/tile/{z}/{y}/{x}` | Environment |
| Wetlands | `mapprod3.environment.nsw.gov.au/.../EP_Wetlands/MapServer/tile/{z}/{y}/{x}` | Environment |
| Riparian | `mapprod3.environment.nsw.gov.au/.../EP_RiparianLands/MapServer/tile/{z}/{y}/{x}` | Environment |
| NSW Best Aerial Imagery | `maps.six.nsw.gov.au/.../LPI_Imagery_Best/MapServer/tile/{z}/{y}/{x}` | Basemap |
| LGA Boundaries | `maps.six.nsw.gov.au/.../LGABoundaries/MapServer/tile/{z}/{y}/{x}` | Admin |

**Effort: 1 hour. Impact: 10x more useful map.**

### 1.2 Replace Hardcoded Calculator Constants

| Current Value | File | Better Source | API/Method |
|---|---|---|---|
| Household size: 2.53 | population-panel.tsx | ABS Census 2021 by LGA | Bulk CSV import (DataPacks) |
| Growth rate: 1.5% | population-panel.tsx | NSW DPE projections by LGA | CSV download from planning.nsw.gov.au |
| 9 FTE/$1M construction | economic-panel.tsx | ABS Construction Industry Survey | SDMX API or bulk import |
| $18,000/person retail | economic-panel.tsx | ABS Household Expenditure Survey | Bulk import |
| $95K avg salary | economic-panel.tsx | ABS Average Weekly Earnings (NSW) | SDMX API |
| 4.5 tCO2e/dw/yr | environmental-panel.tsx | DCCEW NGA Factors (annual workbook) | Manual update to config file |
| 700mm rainfall | environmental-panel.tsx | SILO Climate API | REST API (free key) |
| 0.85 runoff coefficient | environmental-panel.tsx | ARR 2019 guidelines | Static reference |

**Method:** Create a `src/lib/reference-data/` directory with:
- `census-lga.ts` -- ABS Census 2021 aggregates by LGA (household size, income, industry)
- `population-projections.ts` -- NSW DPE projections by LGA
- `emission-factors.ts` -- NGA Factors (updated annually)
- `climate-zones.ts` -- NatHERS zones by postcode

**Effort: 2-3 days. Impact: Calculators become LGA-specific instead of state-average.**

### 1.3 RBA Statistics API (No Auth, JSON)

- **Base URL:** `https://api.rba.gov.au`
- **Auth:** None
- **Useful tables:**
  - `g1` -- CPI (construction cost escalation)
  - `g2` -- Producer Price Index (construction inputs)
  - `a2` -- Cash rate (financing assumptions)
- **Integration:** Fetch in Next.js API route, cache with Upstash Redis (already in dependencies) for 24h
- **Example:** `GET https://api.rba.gov.au/statistics/tables/g1` returns JSON time series

**Effort: Half day. Impact: Real-time cost escalation for economic calculator.**

### 1.4 ABS Data API (No Auth, SDMX-JSON)

- **Base URL:** `https://api.data.abs.gov.au`
- **Auth:** None
- **Key dataflows:**
  - `ERP_QUARTERLY` -- Estimated Resident Population
  - `BUILDING_APPROVALS` -- Monthly dwelling approvals by state/SA4
  - `LABOUR_FORCE` -- Employment by industry
  - `ABS_REGIONAL_ASGS2021` -- Regional statistics by LGA/SA2
- **Example:** `GET https://api.data.abs.gov.au/data/ABS,ERP_QUARTERLY,1.0.0/1.3.1..Q?startPeriod=2023-Q1`
- **Format:** SDMX-JSON (requires parsing logic -- structure is nested but well-documented)

**Effort: 1-2 days. Impact: Replace demo analytics with real building approvals, population trends.**

---

## TIER 2 -- High Value, Moderate Effort (Free API Key Required)

### 2.1 NSW ePlanning DA API

- **Endpoint:** `https://api.apps1.nsw.gov.au/eplanning/data/v0/OnlineDA`
- **Auth:** Free API key from api.nsw.gov.au
- **Rate limit:** ~100 req/min
- **Returns:** DA numbers, status, council, address, lots, cost of works, dwellings, determination
- **Integration:** Daily sync to populate the Projects table. Maps directly to AXIOM fields (`nswStatus`, `lodgementDate`, `lga`, `applicantName`, `dwellings`).
- **This replaces the mock `generatePermitData()` in your analytics API**

**Effort: 2-3 days. Impact: Live DA tracking -- the core value proposition.**

### 2.2 NSW Air Quality API (No Auth)

- **Endpoint:** `https://data.airquality.nsw.gov.au/api/Data/get_Observations`
- **Auth:** None
- **Returns:** Hourly PM2.5, PM10, O3, NO2, AQI from ~40 stations
- **Integration:** Add as map layer (station points with AQI values) + context for environmental assessments

**Effort: 1 day. Impact: Real-time environmental context on map.**

### 2.3 SILO Climate API (Free Key)

- **Endpoint:** `https://www.longpaddock.qld.gov.au/silo/api/`
- **Auth:** Free email-based API key
- **Returns:** Daily rainfall, temperature, evaporation, solar radiation for any lat/lng
- **Integration:** Auto-populate rainfall in the environmental calculator based on project location. Replace the manual 700mm input.

**Effort: Half day. Impact: Accurate stormwater calculations per location.**

### 2.4 BioNet OData API (Free Key)

- **Endpoint:** `https://data.bionet.nsw.gov.au/biosvcapp/odata/SpeciesSightings`
- **Auth:** Free API key (register at data.bionet.nsw.gov.au)
- **Returns:** Threatened species records with lat/lng within a bounding box
- **Integration:** Query when a project is created. If threatened species found, auto-flag "Biodiversity assessment required" in compliance tab.

**Effort: 1 day. Impact: Automated compliance screening.**

### 2.5 Transport for NSW GTFS (Free Key)

- **Portal:** `https://opendata.transport.nsw.gov.au/`
- **Auth:** Free API key
- **Returns:** All train station, bus stop, ferry wharf locations + timetables
- **Integration:** Replace hardcoded train stations in seed.ts with full TfNSW dataset. Calculate transport accessibility scores for project sites (feeds sustainability calculator).

**Effort: 2 days. Impact: Real transit scoring instead of hardcoded points.**

### 2.6 NSW Open Data Portal (CKAN API, No Auth)

- **Base URL:** `https://data.nsw.gov.au/data/api/3/action/`
- **Key datasets:**
  - Development applications (monthly CSV)
  - Population projections (DPE)
  - Housing supply data
  - Dwelling completions
- **SQL query support:** `GET /datastore_search_sql?sql=SELECT * FROM "{id}" WHERE lga='Sydney'`

**Effort: 1-2 days per dataset. Impact: Rich analytics dashboards with real data.**

---

## TIER 3 -- Future Enhancement (Higher Effort / Commercial)

### 3.1 SEED WMS Environmental Layers

- **Endpoint:** Various WMS/WFS on `mapprod3.environment.nsw.gov.au`
- **Layers:** Tree canopy, urban heat island, vegetation types, soil landscapes
- **Mapbox GL:** Consume as WMS raster source with `{bbox-epsg-3857}` template
- **Effort:** Medium per layer (WMS URL construction + Mapbox config)

### 3.2 AURIN (Australian Urban Research Infrastructure Network)

- **Portal:** `https://portal.aurin.org.au/`
- **Auth:** Institutional login (AAF -- government eligible)
- **Data:** Walkability index, liveability, green space, employment accessibility, housing affordability
- **Format:** WFS returning GeoJSON
- **Effort:** High (institutional access setup). Impact: Gold-standard urban research data.

### 3.3 NSW Legislation XML (AI Context)

- **URL:** `https://legislation.nsw.gov.au/`
- **Content:** Full text of all LEPs, SEPPs, EP&A Act in XML
- **Integration:** Parse and feed into AI assistant system prompt as RAG context. When a user asks about zoning, the AI can cite the specific LEP clause.

### 3.4 G-NAF Address Geocoding

- **Source:** `https://data.gov.au/dataset/geocoded-national-address-file`
- **Format:** PSV files, ~15M addresses nationally
- **Integration:** Import NSW addresses into PostGIS for autocomplete in the project creation form

### 3.5 Nearmap (Commercial)

- **URL:** `https://www.nearmap.com/au/en`
- **Format:** WMTS tiles + AI-derived vector layers (building footprints, solar panels, vegetation)
- **Auth:** Commercial subscription
- **Impact:** Highest resolution imagery (5.5cm) + automated feature extraction

### 3.6 CoreLogic (Commercial)

- **URL:** `https://www.corelogic.com.au/`
- **Auth:** Commercial API licence
- **Data:** Property values, sales history, automated valuations
- **Alternative:** NSW Valuer General bulk data (free)

---

## Parcel Query Enhancement (Expand Existing API)

Your `/api/maps/parcels` route already queries Cadastre + Planning. Add these identify queries to the same endpoint:

| Service | Endpoint | Returns |
|---|---|---|
| Height Controls | `EPI_Primary_Planning_Layers/MapServer/identify` (sublayer for HOB) | Max building height |
| Floor Space Ratio | `EPI_Primary_Planning_Layers/MapServer/identify` (sublayer for FSR) | Max FSR |
| Heritage | `EPI_Heritage/MapServer/identify` | Heritage items/conservation areas |
| Bushfire | `Bushfire_Prone_Land/MapServer/identify` | Vegetation category 1/2/3 |
| Flood | `EP_Flooding/MapServer/identify` | Flood planning area Y/N |
| Acid Sulfate | `EP_AcidSulfateSoils/MapServer/identify` | Soil class 1-5 |

**Impact:** Clicking a parcel returns a complete planning constraints summary. This auto-populates the "Site Summary" section in create-project-form.tsx.

---

## Analytics Dashboard -- Replace Demo Data

Your `/api/analytics/[dataset]/route.ts` currently returns hardcoded generators. Replace with:

| Dataset | Current | Replace With |
|---|---|---|
| `permits` | `generatePermitData()` | NSW ePlanning DA API (daily sync) |
| `zoning` | `generateZoningData()` | NSW Planning Portal spatial (query zone areas by LGA) |
| `population` | `generatePopulationData()` | ABS Census + NSW DPE projections |
| `infrastructure` | `generateInfrastructureData()` | data.nsw.gov.au capital works datasets |

---

## AI Assistant Enhancement

Your system prompt in `src/lib/anthropic.ts` should be enriched with:

1. **Project-specific data:** When a projectId is provided, fetch and inject:
   - Zoning info (from Planning identify)
   - Compliance constraints (bushfire, flood, heritage from identify endpoints)
   - Calculator results (population, economic, environmental estimates)
   - ABS demographics for the project's LGA

2. **Regulatory context:** Fetch relevant LEP/SEPP text from `legislation.nsw.gov.au` XML

3. **Precedent search:** Query similar approved DAs from the ePlanning API

---

## API Authentication Summary

| Source | Auth | Cost | Key Registration |
|---|---|---|---|
| NSW Planning Spatial (ArcGIS) | None | Free | N/A |
| NSW Cadastre (SIX Maps) | None | Free | N/A |
| ABS Data API (SDMX) | None | Free | N/A |
| RBA Statistics API | None | Free | N/A |
| NSW Air Quality API | None | Free | N/A |
| NSW Open Data (CKAN) | None | Free | N/A |
| data.gov.au (CKAN) | None | Free | N/A |
| NSW ePlanning DA API | API key | Free | api.nsw.gov.au |
| Transport for NSW | API key | Free | opendata.transport.nsw.gov.au |
| SILO Climate API | API key | Free | longpaddock.qld.gov.au |
| BioNet API | API key | Free | data.bionet.nsw.gov.au |
| City of Sydney (SODA) | App token | Free | data.cityofsydney.nsw.gov.au |
| Geoscape G-NAF | API key | Free | geoscape.com.au |
| AURIN | Institutional (AAF) | Free for govt | aurin.org.au |
| Nearmap | Commercial | Paid | nearmap.com |
| CoreLogic | Commercial | Paid | corelogic.com.au |

---

## Recommended Implementation Order

### Phase 1 (Week 1-2): Foundation
- [ ] Add 8 new map tile layers to seed.ts
- [ ] Expand parcel identify queries (height, FSR, heritage, bushfire, flood, acid sulfate)
- [ ] Create `src/lib/reference-data/` with ABS Census + DPE projection imports
- [ ] Update calculator defaults to be LGA-specific

### Phase 2 (Week 3-4): Live APIs
- [ ] Integrate RBA Statistics API (cost escalation)
- [ ] Integrate SILO Climate API (auto-rainfall)
- [ ] Integrate NSW Air Quality API (map overlay)
- [ ] Register for NSW ePlanning API key

### Phase 3 (Week 5-6): Core Data Feed
- [ ] Connect ePlanning DA API to project sync
- [ ] Replace analytics demo data with ABS + ePlanning
- [ ] Integrate BioNet for automated biodiversity screening
- [ ] Add TfNSW GTFS transit data

### Phase 4 (Week 7-8): Intelligence
- [ ] Enhance AI assistant with regulatory context (LEP/SEPP)
- [ ] Add SEED environmental layers (canopy, heat, vegetation)
- [ ] AURIN walkability/liveability integration
- [ ] Address autocomplete from G-NAF

---

## Attribution Requirements

When using these sources, AXIOM must display:

```
Data sources: NSW Spatial Services, NSW DPHI, NSW RFS,
Transport for NSW, Australian Bureau of Statistics,
NSW EPA, Heritage NSW, Bureau of Meteorology (SILO).
Licensed under CC BY 4.0 unless otherwise noted.
```
