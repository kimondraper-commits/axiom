# AXIOM ← Mosaic Integration Plan

> **Goal:** Absorb the best of Mecone's Mosaic platform into AXIOM so Kimon can walk into a Mecone internship interview and demo a tool that proves he understands their product *better than most of their own staff* — and has built features they don't have.

---

## TL;DR (read this first)

- **Mosaic is a planning data viewer.** Map + 50+ NSW datasets + AI assistant + sieve-rule site finder + BYO data workbench. ~17k users, $19.99/wk for Pro tier.
- **AXIOM is already level or ahead in 10 areas** (calculators, readiness scoring, climate risk, community impact, compliance auto-flagging, project CRUD, BioNet, subsurface, acquisitions, AI tooling).
- **AXIOM is missing 7 things Mosaic has** that matter for the internship pitch — and 5 of them are ~1–3 days of work each.
- **The design language is already 95% aligned** — Mosaic uses dark + spring green (`#5fe26b`), AXIOM uses dark + spring green (`#00e87b`). Same family. No rebrand needed.
- **The pitch becomes:** *"AXIOM = Mosaic's mapping core + things Mosaic doesn't have (calculators, readiness scoring, climate risk modelling, community tracking)."*

---

## 1. The Gap Matrix

### ✅ Where AXIOM matches or beats Mosaic
| Feature | Mosaic | AXIOM |
|---|---|---|
| GIS map with layer toggles | ✓ | ✓ (14+ layers seeded) |
| AI planning assistant | ✓ (BETA) | ✓ (Claude + 8 tools) |
| Project management | — | ✓ (full CRUD, milestones, stakeholders) |
| Calculators (eco/env/pop/sustain) | — | ✓ (4 panels, live RBA/SILO data) |
| Readiness scorecard | — | ✓ (7 weighted criteria) |
| Climate risk panel | — | ✓ (6 risk layers) |
| Community impact tracker | — | ✓ |
| Compliance auto-flagging | — | ✓ |
| Subsurface asset risk | — | ✓ |
| Acquisitions analyzer | — | ✓ |

### ❌ Where Mosaic beats AXIOM (priority gaps)
| # | Feature | Effort | Impact | Notes |
|---|---|---|---|---|
| 1 | **AIM (Automated Intelligence Mapper)** — sieve-rule site finder | HIGH (3–5 days) | ⭐⭐⭐⭐⭐ | THE killer feature. 30+ filters: zoning, height, FSR, overlays, proximity. CSV export. |
| 2 | **Workbench** — BYO datasets (CSV/KML/GeoJSON upload, in-map editing) | MED (2–3 days) | ⭐⭐⭐⭐ | Differentiator vs gov portals. AXIOM has import wizard already — extend it. |
| 3 | **NSW Property Sales lot-level dataset** | LOW–MED (1–2 days) | ⭐⭐⭐⭐ | NSW Valuer-General data is free. 185M records. Big data moat. |
| 4 | **Isochrone tool** (travel-time catchments) | LOW (½ day) | ⭐⭐⭐ | Use Mapbox Isochrone API. Multi-modal, GeoJSON export. |
| 5 | **3D buildings + 3D mode** (pitch/rotate map) | LOW (½ day) | ⭐⭐⭐ | Mapbox supports natively. Just enable + add toggle. |
| 6 | **Automated site PDF report** | MED (1–2 days) | ⭐⭐⭐⭐ | Customizable sections, includes legend. The "client deliverable" feature. |
| 7 | **Nearmap / MetroMap aerial basemap (BYO API key)** | LOW (½ day) | ⭐⭐ | Browser-stored key, no backend. Easy polish. |
| 8 | **Multi-jurisdiction** (VIC/QLD/ACT/WA layers) | HIGH (3–4 days each) | ⭐⭐ | Skip for v1 — AXIOM stays NSW-focused, that's a feature not a bug. |
| 9 | **Drawing tools panel** (line/polygon/radius/measurement) | LOW (½ day) | ⭐⭐ | Mapbox GL Draw library exists. |
| 10 | **NSW DA Insights with weekly refresh + LGA snapshot PDFs** | MED (2 days) | ⭐⭐⭐⭐ | AXIOM already has /live-das, just needs PDF export + LGA filter. |

---

## 2. The 10 Features Worth Absorbing (PRIORITIZED)

### 🎯 Tier 1 — Build these first (1 week sprint)
These are HIGH-IMPACT and MEDIUM-OR-LESS effort. Maximum demo value per hour.

1. **AIM (sieve-rule site finder)** — the single most differentiating Mosaic feature
2. **3D map mode + 3D buildings** — instant visual upgrade
3. **Isochrone tool** — Mapbox API does the heavy lifting
4. **Drawing tools panel** (line, polygon, radius, measurement)
5. **Aerial basemap (BYO Nearmap/MetroMap key)** — pure polish

### 🎯 Tier 2 — High-value additions (1 week sprint)
6. **Automated site PDF report** — extend existing report generation
7. **NSW Property Sales lot-level integration** — Valuer-General free data
8. **DA Insights LGA Snapshot PDF** — extend existing /live-das page
9. **Workbench upgrade** — extend import wizard with KML/GeoJSON + in-map editing

### 🎯 Tier 3 — Polish & differentiation (½ week)
10. **"NEW FEATURE" callout cards** in the layers panel (the green inline cards Mosaic uses to advertise new tools — high conversion, looks native)

---

## 3. Design System Alignment

**Good news:** Already 95% there.

| Element | Mosaic | AXIOM | Action |
|---|---|---|---|
| Background | Near-black `#0a1014` + dark green `#0d2820` | `--black #04060a`, `--deep #080c10`, `--surface #0d1117` | ✅ Match |
| Primary accent | Spring green `#5fe26b` | `--green #00e87b` | ✅ Same family (slightly more saturated) |
| Typography | Single sans (Inter-like), uppercase small caps for sections | Exo 2 / Chakra Petch / Rajdhani / Share Tech Mono | ✅ Same vibe (AXIOM is more techy) |
| Layout | Vertical icon rail + slide-over panels | Currently sidebar nav | 🔄 **Consider switching to vertical icon rail + panel pattern** for the maps page |
| Layer rows | Pill toggle + label + PRO badge + info icon | Category list | 🔄 **Adopt the pill-toggle row pattern** |
| Marketing modals | Bright lime panel + black panel split + isometric illustrations | None | 🆕 Commission isometric illustrations for empty states / onboarding |

**One tactical decision:** Mosaic's layers panel pattern (pill toggle + tight 24px row + status dot + info icon) is the cleanest GIS layer picker in civic tech. Worth copying directly.

---

## 4. Phased Roadmap

### Phase A — Map Power-Up (Week 1)
**Goal:** make the maps page feel as capable as Mosaic's.
- [ ] 3D mode toggle + 3D buildings
- [ ] Drawing tools (line, polygon, radius)
- [ ] Isochrone tool
- [ ] Measurement tool
- [ ] Vertical icon rail UI refactor
- [ ] Pill-toggle layer panel redesign
- [ ] Aerial basemap toggle (with BYO API key UI)

### Phase B — The Killer Feature (Week 2)
**Goal:** ship AIM. This is the demo headline.
- [ ] Build sieve-rule engine (filter parcels by zone, height, FSR, overlays, proximity)
- [ ] UI for chaining 5–30+ filter rules
- [ ] Result map highlighting + count
- [ ] CSV export of matching sites
- [ ] Saved searches

### Phase C — Data & Reports (Week 3)
**Goal:** match Mosaic's data depth and deliverable quality.
- [ ] NSW Property Sales integration (Valuer-General free data)
- [ ] Workbench upgrade — KML + GeoJSON + in-map editing
- [ ] Automated site PDF report (customizable sections + legend)
- [ ] DA LGA Snapshot PDF (extend /live-das)

### Phase D — Polish (Week 4)
- [ ] Inline "NEW FEATURE" callout cards in layers panel
- [ ] Isometric illustrations for empty states / onboarding
- [ ] Marketing modal pattern for upgrades / new feature announcements

---

## 5. The Internship Angle

Mecone's Plantech team is **small** (Martin Karm leads it). They mostly hire planners + GIS analysts, **not software engineers**. There are no current open engineering roles publicly listed.

**This is actually the opportunity.** A 20-year-old urban planning student who walks in with a working Mosaic-equivalent that has features Mosaic doesn't (calculators, readiness scoring, climate risk modelling) is going to be the most memorable applicant they've seen in years.

**Pitch structure:**
1. *"I've been using Mosaic for [X months] and noticed [3 specific things about it]"*
2. *"I built AXIOM as a learning project — it has Mosaic's mapping core + [calculators / readiness / climate]"*
3. *"Here's a 5-minute demo, and here's the GitHub repo"*
4. *"I'd love to learn how Mecone's planning team uses Mosaic in real projects, and where you see Plantech going next"*

**What NOT to do:** Don't pitch AXIOM as a competitor. Pitch it as a *learning artifact* that proves you can ship.

---

## 6. Open Questions for Kimon

Before we start building, I need answers to these:

1. **Priority order?** Tier 1 first (map power-up) or Tier 2 first (data + reports)? The killer demo is AIM (Tier 2) but AIM is useless without the map being polished (Tier 1).
2. **Internship deadline?** When are you applying? This sets the sprint length.
3. **NSW only?** Confirm we skip multi-jurisdiction (VIC/QLD/ACT/WA) for v1 — yes/no?
4. **Workbench scope:** do you want full BYO datasets (KML/GeoJSON upload + in-map editing) or just polish the existing CSV import wizard?
5. **AIM scope:** start with 5 sieve rules (zone, height, FSR, lot size, distance to station) or go all-in with 30+?
6. **PDF reports:** which sections matter most? (site constraints, planning controls, compliance, calculator outputs, all of the above?)
7. **Aerial imagery:** do you have a Nearmap or MetroMap account, or should we skip this and use OSM/satellite tiles?
8. **AIM saved searches:** per-user or shared across team?

---

## 7. Source Material

- `/Users/kimondraper/Desktop/city-pro/Mosaic/MOSAIC.docx` — 779 lines, full Mosaic feature/changelog/onboarding doc
- `/Users/kimondraper/Desktop/city-pro/Mosaic/Screenshot 2026-04-06 *.png` — 26 UI screenshots
- mecone.com.au, meconemosaic.au, theurbandeveloper.com (web research)

---

## Status

- [x] Source material gathered
- [x] Three parallel research agents completed (docx + screenshots + web)
- [x] Plan written
- [ ] **Awaiting Kimon's answers to Section 6 before implementation**
