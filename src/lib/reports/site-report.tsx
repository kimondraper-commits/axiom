import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const green = "#00e87b";
const dark = "#04060a";
const surface = "#0d1117";
const ghost = "#6c7680";
const textPrimary = "#e8edf2";

const s = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: dark,
    color: textPrimary,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  cover: {
    marginBottom: 30,
  },
  eyebrow: {
    fontSize: 8,
    letterSpacing: 2,
    color: green,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: ghost,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 8,
    letterSpacing: 2,
    color: green,
    textTransform: "uppercase",
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  label: {
    fontSize: 9,
    color: ghost,
    width: "40%",
  },
  value: {
    fontSize: 9,
    color: textPrimary,
    fontWeight: "bold",
    width: "60%",
    textAlign: "right",
  },
  card: {
    backgroundColor: surface,
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: green,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    fontSize: 7,
    color: ghost,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: 6,
  },
});

export interface SiteReportData {
  address?: string;
  lotPlan?: string;
  lga?: string;
  zone?: string;
  epi?: string;
  heightLimit?: string;
  fsr?: string;
  heritage?: string;
  bushfire?: string;
  floodRisk?: string;
  acidSulfate?: string;
  lotArea?: string;
  // Calculator outputs (optional)
  dwellings?: number;
  estimatedPopulation?: number;
  constructionJobs?: number;
  co2Tonnes?: number;
  // Compliance
  complianceFlags?: { label: string; status: string; note?: string }[];
  // Valuations
  valuations?: { year: string; landValue: string }[];
}

export function SiteReport({ data }: { data: SiteReportData }) {
  const now = new Date().toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Cover */}
        <View style={s.cover}>
          <Text style={s.eyebrow}>AXIOM Site Report</Text>
          <Text style={s.title}>{data.address ?? data.lotPlan ?? "Site Report"}</Text>
          <Text style={s.subtitle}>
            {data.lga ? `${data.lga} LGA` : ""} {data.zone ? `• ${data.zone}` : ""} • Generated {now}
          </Text>
        </View>

        {/* Site Constraints */}
        <Text style={s.sectionHeader}>Site Constraints</Text>
        <View style={s.card}>
          <DataRow label="Lot/Plan" value={data.lotPlan} />
          <DataRow label="Address" value={data.address} />
          <DataRow label="Lot Area" value={data.lotArea} />
          <DataRow label="LGA" value={data.lga} />
        </View>

        {/* Planning Controls */}
        <Text style={s.sectionHeader}>Planning Controls</Text>
        <View style={s.card}>
          <DataRow label="Zone" value={data.zone} />
          <DataRow label="LEP/EPI" value={data.epi} />
          <DataRow label="Height Limit" value={data.heightLimit} />
          <DataRow label="FSR" value={data.fsr} />
          <DataRow label="Heritage" value={data.heritage} />
          <DataRow label="Bushfire" value={data.bushfire} />
          <DataRow label="Flood Risk" value={data.floodRisk} />
          <DataRow label="Acid Sulfate" value={data.acidSulfate} />
        </View>

        {/* Valuations */}
        {data.valuations && data.valuations.length > 0 && (
          <>
            <Text style={s.sectionHeader}>Land Valuations</Text>
            <View style={s.card}>
              {data.valuations.map((v, i) => (
                <DataRow key={i} label={v.year} value={v.landValue} />
              ))}
            </View>
          </>
        )}

        {/* Calculator Outputs */}
        {(data.dwellings || data.estimatedPopulation || data.constructionJobs || data.co2Tonnes) && (
          <>
            <Text style={s.sectionHeader}>Calculator Outputs</Text>
            <View style={s.card}>
              <DataRow label="Dwellings" value={data.dwellings?.toString()} />
              <DataRow label="Est. Population" value={data.estimatedPopulation?.toString()} />
              <DataRow label="Construction Jobs (FTE)" value={data.constructionJobs?.toString()} />
              <DataRow label="CO₂ Emissions (tonnes)" value={data.co2Tonnes?.toString()} />
            </View>
          </>
        )}

        {/* Compliance */}
        {data.complianceFlags && data.complianceFlags.length > 0 && (
          <>
            <Text style={s.sectionHeader}>Compliance Flags</Text>
            <View style={s.card}>
              {data.complianceFlags.map((f, i) => (
                <View key={i} style={s.row}>
                  <Text style={s.label}>{f.label}</Text>
                  <Text
                    style={{
                      ...s.value,
                      color: f.status === "FLAGGED" ? "#ff5e5e" : green,
                    }}
                  >
                    {f.status}
                    {f.note ? ` — ${f.note}` : ""}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text>AXIOM Urban Intelligence Platform</Text>
          <Text>{now}</Text>
        </View>
      </Page>
    </Document>
  );
}

function DataRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}
