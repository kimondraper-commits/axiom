# AXIOM Data Integration — Implementation Status

## Phase 1: Foundation
- [x] Step 1: Centralized reference-data constants (`src/lib/reference-data/`)
- [x] Step 2: Updated 6 calculator files to use reference-data imports
- [x] Step 3: Added 10 new map layers to `prisma/seed.ts`
- [x] Step 4: Expanded parcels API with Heritage/Bushfire/Flood/AcidSulfate endpoints
- [x] Step 5: Wired create-project form to GIS (geocode + parcels API + site summary)

## Phase 2: Live APIs
- [x] Step 6: Redis caching layer (`src/lib/data-sources/cache.ts`)
- [x] Step 7: 7 external API wrappers (RBA, ABS, SILO, NSW Air, ePlanning, BioNet, TfNSW)
- [x] Step 8: Analytics route rewritten with ABS live data + NSW curated data + fallbacks

## Phase 3: Core Data Feeds
- [x] Step 9: 3 new API routes (ePlanning, BioNet, TfNSW stops)
- [x] Step 10: Train stations layer updated to use API URL
- [x] Step 11: Auto-flag compliance items from site lookup

## Phase 4: Intelligence
- [x] Step 12: AI system prompt rewritten for NSW EP&A Act focus + site constraints injection

## Verification Checklist
- [ ] `npx prisma db seed` — verify 14 layers appear
- [ ] Click parcel on map — popup shows height/FSR/heritage/bushfire/flood/acid sulfate
- [ ] Calculator constants imported from reference-data (same values)
- [ ] Create project with Sydney address — "Lookup site from GIS" populates Site Summary
- [ ] /analytics — data from ABS/curated sources (check meta.source)
- [ ] Dev server — all routes return 200

## Environment Variables Needed
```
SILO_API_KEY=           # Free from longpaddock.qld.gov.au
NSW_EPLANNING_API_KEY=  # Free from api.nsw.gov.au
TFNSW_API_KEY=          # Free from opendata.transport.nsw.gov.au
```
