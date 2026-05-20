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
  eyebrow: {
    fontSize: 8,
    letterSpacing: 2,
    color: green,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: ghost,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 8,
    letterSpacing: 2,
    color: green,
    textTransform: "uppercase",
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  statRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: surface,
    borderRadius: 4,
    padding: 10,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: green,
  },
  statLabel: {
    fontSize: 7,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: ghost,
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: surface,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  thCell: {
    fontSize: 7,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: green,
    fontWeight: "bold",
  },
  tdCell: {
    fontSize: 8,
    color: textPrimary,
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

export interface DaSnapshotData {
  council: string;
  fromDate?: string;
  toDate?: string;
  totalDAs: number;
  statusBreakdown: { status: string; count: number }[];
  typeBreakdown: { type: string; count: number }[];
  das: {
    applicationId: string;
    applicationType: string;
    status: string;
    address: string;
  }[];
}

export function DaSnapshot({ data }: { data: DaSnapshotData }) {
  const now = new Date().toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.eyebrow}>AXIOM DA Snapshot</Text>
        <Text style={s.title}>{data.council}</Text>
        <Text style={s.subtitle}>
          {data.fromDate && data.toDate
            ? `${data.fromDate} — ${data.toDate}`
            : "All available DAs"}{" "}
          • Generated {now}
        </Text>

        {/* Stats row */}
        <View style={s.statRow}>
          <View style={s.statCard}>
            <Text style={s.statValue}>{data.totalDAs}</Text>
            <Text style={s.statLabel}>Total DAs</Text>
          </View>
          {data.statusBreakdown.slice(0, 3).map((sb, i) => (
            <View key={i} style={s.statCard}>
              <Text style={s.statValue}>{sb.count}</Text>
              <Text style={s.statLabel}>{sb.status}</Text>
            </View>
          ))}
        </View>

        {/* Status breakdown */}
        <Text style={s.sectionHeader}>By Status</Text>
        {data.statusBreakdown.map((sb, i) => (
          <View key={i} style={s.tableRow}>
            <Text style={{ ...s.tdCell, width: "60%" }}>{sb.status}</Text>
            <Text style={{ ...s.tdCell, width: "40%", textAlign: "right", fontWeight: "bold" }}>
              {sb.count}
            </Text>
          </View>
        ))}

        {/* Type breakdown */}
        {data.typeBreakdown.length > 0 && (
          <>
            <Text style={s.sectionHeader}>By Development Type</Text>
            {data.typeBreakdown.slice(0, 10).map((tb, i) => (
              <View key={i} style={s.tableRow}>
                <Text style={{ ...s.tdCell, width: "60%" }}>{tb.type}</Text>
                <Text style={{ ...s.tdCell, width: "40%", textAlign: "right", fontWeight: "bold" }}>
                  {tb.count}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* DA table (first 20) */}
        <Text style={s.sectionHeader}>Recent DAs ({Math.min(data.das.length, 20)} shown)</Text>
        <View style={s.tableHeader}>
          <Text style={{ ...s.thCell, width: "25%" }}>Application</Text>
          <Text style={{ ...s.thCell, width: "25%" }}>Type</Text>
          <Text style={{ ...s.thCell, width: "20%" }}>Status</Text>
          <Text style={{ ...s.thCell, width: "30%" }}>Address</Text>
        </View>
        {data.das.slice(0, 20).map((da, i) => (
          <View key={i} style={s.tableRow}>
            <Text style={{ ...s.tdCell, width: "25%" }}>{da.applicationId}</Text>
            <Text style={{ ...s.tdCell, width: "25%" }}>{da.applicationType}</Text>
            <Text style={{ ...s.tdCell, width: "20%" }}>{da.status}</Text>
            <Text style={{ ...s.tdCell, width: "30%" }}>{da.address}</Text>
          </View>
        ))}

        <View style={s.footer} fixed>
          <Text>AXIOM Urban Intelligence Platform</Text>
          <Text>{now}</Text>
        </View>
      </Page>
    </Document>
  );
}
