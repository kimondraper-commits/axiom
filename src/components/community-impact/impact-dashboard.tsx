"use client";

import { useState, useMemo } from "react";
import {
  LGA_HOUSEHOLD_SIZE,
  ABS_AVG_HOUSEHOLD_SIZE,
  getDefaults,
} from "@/lib/reference-data";

/* ------------------------------------------------------------------ */
/*  Sample infrastructure data (will be replaced with real APIs later) */
/* ------------------------------------------------------------------ */

const SAMPLE_SCHOOLS: Record<
  string,
  { name: string; distanceKm: number; enrolled: number; capacity: number }[]
> = {
  default: [
    { name: "Parramatta Public School", distanceKm: 1.2, enrolled: 487, capacity: 520 },
    { name: "Arthur Phillip High School", distanceKm: 1.8, enrolled: 1120, capacity: 1200 },
    { name: "Parramatta East Public School", distanceKm: 2.0, enrolled: 312, capacity: 400 },
  ],
};

const SAMPLE_HOSPITALS: Record<
  string,
  { name: string; distanceKm: number; type: string }[]
> = {
  default: [
    { name: "Westmead Hospital", distanceKm: 3.2, type: "Level 1 Trauma Centre" },
    { name: "Parramatta Community Health", distanceKm: 1.1, type: "Community Health Centre" },
  ],
};

const SAMPLE_PARKS: Record<
  string,
  { name: string; distanceM: number; areaHa: number }[]
> = {
  default: [
    { name: "Parramatta Park", distanceM: 400, areaHa: 85 },
    { name: "Robin Thomas Reserve", distanceM: 600, areaHa: 1.2 },
    { name: "Jubilee Park", distanceM: 780, areaHa: 3.8 },
  ],
};

const SAMPLE_TRANSPORT: Record<
  string,
  { stations: { name: string; distanceM: number }[]; busRoutes: number }
> = {
  default: {
    stations: [
      { name: "Parramatta Station", distanceM: 600 },
      { name: "Harris Park Station", distanceM: 1200 },
    ],
    busRoutes: 8,
  },
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const VEHICLE_TRIPS_PER_DWELLING = 3.4; // RMS standard
const PEAK_HOUR_FRACTION = 0.1;
const OPEN_SPACE_BENCHMARK_HA_PER_1000 = 2.83;

/* ------------------------------------------------------------------ */
/*  Shared styles                                                      */
/* ------------------------------------------------------------------ */

const cardStyle: React.CSSProperties = {
  background: "var(--carbon)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: 20,
  position: "relative",
  overflow: "hidden",
};

const cardLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "var(--gold-dim)",
  marginBottom: 12,
};

const bigNumberStyle: React.CSSProperties = {
  fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
  fontWeight: 700,
  fontSize: 28,
  color: "var(--text-primary)",
};

const subTextStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text-secondary)",
  marginTop: 4,
};

const accentBar = (color: string): React.CSSProperties => ({
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  width: 4,
  background: color,
  borderRadius: "8px 0 0 8px",
});

/* ------------------------------------------------------------------ */
/*  Capacity bar                                                       */
/* ------------------------------------------------------------------ */

function CapacityBar({ pct }: { pct: number }) {
  const color = pct > 95 ? "#DC2626" : pct > 80 ? "#D97706" : "#059669";
  return (
    <div
      className="h-1.5 rounded-full overflow-hidden"
      style={{ background: "var(--bg-tertiary)", marginTop: 4 }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.min(pct, 100)}%`,
          background: color,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Transport score                                                    */
/* ------------------------------------------------------------------ */

function calcTransportScore(stationCount: number, busRoutes: number, nearestStationM: number): number {
  let score = 0;
  if (nearestStationM <= 400) score += 40;
  else if (nearestStationM <= 800) score += 25;
  else if (nearestStationM <= 1200) score += 10;
  score += Math.min(stationCount * 15, 30);
  score += Math.min(busRoutes * 4, 30);
  return Math.min(score, 100);
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function ImpactDashboard() {
  const lgaNames = Object.keys(LGA_HOUSEHOLD_SIZE).sort();
  const [dwellings, setDwellings] = useState(200);
  const [selectedLga, setSelectedLga] = useState("");

  const results = useMemo(() => {
    const defaults = getDefaults(selectedLga || null);
    const newResidents = Math.round(dwellings * defaults.householdSize);

    // Schools
    const schools = SAMPLE_SCHOOLS.default;

    // Hospitals
    const hospitals = SAMPLE_HOSPITALS.default;

    // Parks
    const parks = SAMPLE_PARKS.default;
    const parksWithin800m = parks.filter((p) => p.distanceM <= 800);
    const totalOpenSpaceHa = parksWithin800m.reduce((s, p) => s + p.areaHa, 0);

    // Transport
    const transport = SAMPLE_TRANSPORT.default;
    const nearestStation = transport.stations.reduce(
      (min, s) => (s.distanceM < min ? s.distanceM : min),
      Infinity
    );
    const transportScore = calcTransportScore(
      transport.stations.length,
      transport.busRoutes,
      nearestStation
    );

    // Traffic
    const dailyTrips = Math.round(dwellings * VEHICLE_TRIPS_PER_DWELLING);
    const peakTrips = Math.round(dailyTrips * PEAK_HOUR_FRACTION);

    return {
      newResidents,
      householdSize: defaults.householdSize,
      schools,
      hospitals,
      parks: parksWithin800m,
      totalOpenSpaceHa,
      transport,
      transportScore,
      nearestStation,
      dailyTrips,
      peakTrips,
    };
  }, [dwellings, selectedLga]);

  const inputLabelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
    fontWeight: 400,
    fontSize: 12,
    color: "var(--text-secondary)",
    marginBottom: 4,
  };

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div
        style={{
          background: "var(--carbon)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <p style={cardLabelStyle}>Development Parameters</p>
        <div className="flex gap-4">
          <div className="flex-1">
            <label style={inputLabelStyle}>Number of Dwellings</label>
            <input
              type="number"
              value={dwellings}
              onChange={(e) => setDwellings(Math.max(0, Number(e.target.value)))}
              min={0}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label style={inputLabelStyle}>LGA</label>
            <select
              value={selectedLga}
              onChange={(e) => setSelectedLga(e.target.value)}
              className="w-full"
            >
              <option value="">NSW State Average</option>
              {lgaNames.map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Impact Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* 1. Population Impact */}
        <div style={cardStyle}>
          <div style={accentBar("#6366F1")} />
          <p style={cardLabelStyle}>Population Impact</p>
          <p style={bigNumberStyle}>
            +{results.newResidents.toLocaleString()}
            <span
              style={{
                fontWeight: 300,
                fontSize: 14,
                color: "var(--text-secondary)",
                marginLeft: 8,
              }}
            >
              new residents
            </span>
          </p>
          <p style={subTextStyle}>
            {dwellings.toLocaleString()} dwellings x {results.householdSize} avg
            household size
            {selectedLga ? ` (${selectedLga})` : " (NSW avg)"}
          </p>
          <p style={{ ...subTextStyle, fontSize: 11, color: "var(--text-ghost)" }}>
            Source: ABS Census 2021
          </p>
        </div>

        {/* 2. School Capacity */}
        <div style={cardStyle}>
          <div style={accentBar("#F59E0B")} />
          <p style={cardLabelStyle}>School Capacity</p>
          <div className="space-y-3">
            {results.schools.map((s) => {
              const pct = Math.round((s.enrolled / s.capacity) * 100);
              const color =
                pct > 95 ? "#DC2626" : pct > 80 ? "#D97706" : "#059669";
              return (
                <div key={s.name}>
                  <div className="flex justify-between items-baseline">
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--text-primary)",
                        fontWeight: 500,
                      }}
                    >
                      {s.name}
                    </span>
                    <span
                      style={{
                        fontFamily:
                          "var(--font-jetbrains, 'PT Mono', monospace)",
                        fontSize: 11,
                        color,
                      }}
                    >
                      {s.enrolled}/{s.capacity} ({pct}%)
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-ghost)",
                    }}
                  >
                    {s.distanceKm}km away
                  </p>
                  <CapacityBar pct={pct} />
                </div>
              );
            })}
          </div>
          <p
            style={{
              ...subTextStyle,
              fontSize: 11,
              color: "var(--text-ghost)",
              marginTop: 8,
            }}
          >
            Sample data — nearest 3 schools within 2km
          </p>
        </div>

        {/* 3. Health Facilities */}
        <div style={cardStyle}>
          <div style={accentBar("#EF4444")} />
          <p style={cardLabelStyle}>Health Facilities</p>
          <div className="space-y-3">
            {results.hospitals.map((h) => (
              <div key={h.name}>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-primary)",
                    fontWeight: 500,
                  }}
                >
                  {h.name}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {h.distanceKm}km — {h.type}
                </p>
              </div>
            ))}
          </div>
          <p
            style={{
              ...subTextStyle,
              fontSize: 11,
              color: "var(--text-ghost)",
              marginTop: 8,
            }}
          >
            Sample data — nearest facilities within 10km
          </p>
        </div>

        {/* 4. Parks & Open Space */}
        <div style={cardStyle}>
          <div style={accentBar("#10B981")} />
          <p style={cardLabelStyle}>Parks &amp; Open Space</p>
          <p style={bigNumberStyle}>
            {results.parks.length}
            <span
              style={{
                fontWeight: 300,
                fontSize: 14,
                color: "var(--text-secondary)",
                marginLeft: 8,
              }}
            >
              parks within 800m
            </span>
          </p>
          <p style={subTextStyle}>
            Total open space: {results.totalOpenSpaceHa.toFixed(1)} ha
          </p>
          <div className="mt-3 space-y-1">
            {results.parks.map((p) => (
              <div
                key={p.name}
                className="flex justify-between"
                style={{ fontSize: 12, color: "var(--text-secondary)" }}
              >
                <span>{p.name}</span>
                <span
                  style={{
                    fontFamily:
                      "var(--font-jetbrains, 'PT Mono', monospace)",
                    fontSize: 11,
                    color: "var(--text-ghost)",
                  }}
                >
                  {p.distanceM}m · {p.areaHa} ha
                </span>
              </div>
            ))}
          </div>
          <p
            style={{
              ...subTextStyle,
              fontSize: 11,
              color: "var(--text-ghost)",
              marginTop: 8,
            }}
          >
            Benchmark: {OPEN_SPACE_BENCHMARK_HA_PER_1000} ha per 1,000 residents
          </p>
        </div>

        {/* 5. Transport Access */}
        <div style={cardStyle}>
          <div style={accentBar("#3B82F6")} />
          <p style={cardLabelStyle}>Transport Access</p>
          <p style={bigNumberStyle}>
            {results.transportScore}
            <span
              style={{
                fontWeight: 300,
                fontSize: 14,
                color: "var(--text-secondary)",
                marginLeft: 4,
              }}
            >
              / 100
            </span>
          </p>
          <p style={subTextStyle}>Transport Accessibility Score</p>
          <div className="mt-3 space-y-1">
            {results.transport.stations.map((s) => (
              <div
                key={s.name}
                className="flex justify-between"
                style={{ fontSize: 12, color: "var(--text-secondary)" }}
              >
                <span>{s.name}</span>
                <span
                  style={{
                    fontFamily:
                      "var(--font-jetbrains, 'PT Mono', monospace)",
                    fontSize: 11,
                    color: "var(--text-ghost)",
                  }}
                >
                  {s.distanceM}m
                </span>
              </div>
            ))}
            <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {results.transport.busRoutes} bus routes within 800m
            </p>
          </div>
          <p
            style={{
              ...subTextStyle,
              fontSize: 11,
              color: "var(--text-ghost)",
              marginTop: 8,
            }}
          >
            Source: TfNSW Open Data
          </p>
        </div>

        {/* 6. Traffic Impact */}
        <div style={cardStyle}>
          <div style={accentBar("#F97316")} />
          <p style={cardLabelStyle}>Traffic Impact</p>
          <p style={bigNumberStyle}>
            +{results.dailyTrips.toLocaleString()}
            <span
              style={{
                fontWeight: 300,
                fontSize: 14,
                color: "var(--text-secondary)",
                marginLeft: 8,
              }}
            >
              daily vehicle trips
            </span>
          </p>
          <p style={subTextStyle}>
            +{results.peakTrips.toLocaleString()} peak hour trips (
            {Math.round(PEAK_HOUR_FRACTION * 100)}% of daily)
          </p>
          <p
            style={{
              ...subTextStyle,
              fontSize: 11,
              color: "var(--text-ghost)",
            }}
          >
            {dwellings.toLocaleString()} dwellings x {VEHICLE_TRIPS_PER_DWELLING} trips/dw
            (TfNSW / RMS standard)
          </p>
        </div>
      </div>
    </div>
  );
}
