"use client";

import { useState, useMemo } from "react";

interface Submission {
  id: string;
  date: string;
  submitter: string;
  category: string;
  summary: string;
  status: "New" | "Under Review" | "Response Drafted" | "Closed";
  sentiment: "Supportive" | "Neutral" | "Opposed";
}

const CATEGORIES = [
  "Traffic",
  "Height/Density",
  "Heritage",
  "Noise",
  "Environment",
  "Infrastructure",
  "Other",
];

const STATUS_OPTIONS: Submission["status"][] = [
  "New",
  "Under Review",
  "Response Drafted",
  "Closed",
];

const SENTIMENT_OPTIONS: Submission["sentiment"][] = [
  "Supportive",
  "Neutral",
  "Opposed",
];

const STATUS_COLORS: Record<string, string> = {
  New: "#DC2626",
  "Under Review": "#D97706",
  "Response Drafted": "#3B82F6",
  Closed: "#059669",
};

const SENTIMENT_COLORS: Record<string, string> = {
  Supportive: "#059669",
  Neutral: "#6B7280",
  Opposed: "#DC2626",
};

interface MythBuster {
  claim: string;
  fact: string;
  source: string;
}

const SAMPLE_MYTHS: MythBuster[] = [
  {
    claim: "This development will add 1,000 cars to local roads",
    fact: "Traffic analysis estimates 340 peak-hour trips based on 200 dwellings x 3.4 trips/dwelling (RMS standard), with 10% peak-hour factor",
    source: "Traffic Impact Assessment, Smith Engineering, Jan 2026",
  },
  {
    claim: "The 15-storey tower will overshadow the entire park",
    fact: "Shadow analysis shows the park receives full sun between 10am-2pm mid-winter. Overshadowing affects 12% of the park area at 9am only.",
    source: "Shadow Diagrams, Architecture Studio, Dec 2025",
  },
];

let nextId = 100;

const SAMPLE_SUBMISSIONS: Submission[] = [
  { id: "SUB-001", date: "2026-02-15", submitter: "J. Smith", category: "Traffic", summary: "Concerned about increased traffic on Church St during construction and post-completion.", status: "Under Review", sentiment: "Opposed" },
  { id: "SUB-002", date: "2026-02-16", submitter: "M. Chen", category: "Height/Density", summary: "Supports the mixed-use design but requests height be limited to 12 storeys.", status: "Response Drafted", sentiment: "Neutral" },
  { id: "SUB-003", date: "2026-02-17", submitter: "Parramatta Heritage Society", category: "Heritage", summary: "Objects to demolition of 18 Church St (locally listed heritage item). Requests adaptive reuse.", status: "New", sentiment: "Opposed" },
  { id: "SUB-004", date: "2026-02-18", submitter: "Anonymous", category: "Environment", summary: "Requests tree canopy assessment and replacement plan for 23 mature trees on site.", status: "Under Review", sentiment: "Opposed" },
  { id: "SUB-005", date: "2026-02-20", submitter: "K. Patel", category: "Infrastructure", summary: "Welcomes new public plaza and through-site link. Asks about public art provisions.", status: "Closed", sentiment: "Supportive" },
  { id: "SUB-006", date: "2026-02-22", submitter: "R. Williams", category: "Noise", summary: "Requests construction hours be limited to 7am-5pm weekdays only. Adjacent to aged care.", status: "New", sentiment: "Opposed" },
];

const cardLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)",
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "var(--gold-dim)",
  marginBottom: 12,
};

export function SubmissionsTracker() {
  const [submissions, setSubmissions] = useState<Submission[]>(SAMPLE_SUBMISSIONS);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formSubmitter, setFormSubmitter] = useState("");
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formSummary, setFormSummary] = useState("");
  const [formSentiment, setFormSentiment] = useState<Submission["sentiment"]>("Neutral");

  const analytics = useMemo(() => {
    const byCategory = submissions.reduce(
      (acc, s) => ({ ...acc, [s.category]: (acc[s.category] ?? 0) + 1 }),
      {} as Record<string, number>
    );
    const bySentiment = submissions.reduce(
      (acc, s) => ({ ...acc, [s.sentiment]: (acc[s.sentiment] ?? 0) + 1 }),
      {} as Record<string, number>
    );
    const byStatus = submissions.reduce(
      (acc, s) => ({ ...acc, [s.status]: (acc[s.status] ?? 0) + 1 }),
      {} as Record<string, number>
    );
    return { byCategory, bySentiment, byStatus, total: submissions.length };
  }, [submissions]);

  const handleSubmit = () => {
    const newSub: Submission = {
      id: `SUB-${String(++nextId).padStart(3, "0")}`,
      date: new Date().toISOString().slice(0, 10),
      submitter: formSubmitter || "Anonymous",
      category: formCategory,
      summary: formSummary,
      status: "New",
      sentiment: formSentiment,
    };
    setSubmissions((prev) => [newSub, ...prev]);
    setFormSubmitter("");
    setFormSummary("");
    setFormSentiment("Neutral");
    setShowForm(false);
  };

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
      {/* Analytics Row */}
      <div className="grid grid-cols-4 gap-4">
        <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
          <p style={cardLabelStyle}>Total Submissions</p>
          <p style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 700, fontSize: 28, color: "var(--text-primary)" }}>
            {analytics.total}
          </p>
        </div>
        {SENTIMENT_OPTIONS.map((s) => (
          <div key={s} style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
            <p style={cardLabelStyle}>{s}</p>
            <p style={{ fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)", fontWeight: 700, fontSize: 28, color: SENTIMENT_COLORS[s] }}>
              {analytics.bySentiment[s] ?? 0}
              <span style={{ fontWeight: 400, fontSize: 14, color: "var(--text-ghost)", marginLeft: 6 }}>
                ({analytics.total > 0 ? Math.round(((analytics.bySentiment[s] ?? 0) / analytics.total) * 100) : 0}%)
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 8, padding: 20 }}>
        <p style={cardLabelStyle}>Submissions by Category</p>
        <div className="space-y-2">
          {Object.entries(analytics.byCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, count]) => {
              const pct = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span style={{ width: 120, fontSize: 12, color: "var(--text-secondary)" }}>{cat}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--gold)", transition: "width 0.4s ease" }} />
                  </div>
                  <span style={{ fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", fontSize: 11, color: "var(--text-ghost)", width: 40, textAlign: "right" }}>
                    {count}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Add Submission */}
      <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 8, padding: 20 }}>
        <div className="flex items-center justify-between mb-3">
          <p style={cardLabelStyle}>Submissions</p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-1.5 text-xs rounded-md border font-medium transition-colors"
            style={{
              background: "linear-gradient(135deg, var(--gold-dim), var(--gold))",
              color: "var(--void)",
              borderColor: "var(--gold)",
            }}
          >
            {showForm ? "Cancel" : "+ Add Submission"}
          </button>
        </div>

        {showForm && (
          <div className="mb-4 p-4 rounded-lg space-y-3" style={{ background: "var(--bg-primary)", border: "1px solid var(--border)" }}>
            <div className="flex gap-3">
              <div className="flex-1">
                <label style={inputLabelStyle}>Submitter Name</label>
                <input value={formSubmitter} onChange={(e) => setFormSubmitter(e.target.value)} placeholder="Anonymous" className="w-full" />
              </div>
              <div>
                <label style={inputLabelStyle}>Category</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full">
                  {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <div>
                <label style={inputLabelStyle}>Sentiment</label>
                <select value={formSentiment} onChange={(e) => setFormSentiment(e.target.value as Submission["sentiment"])} className="w-full">
                  {SENTIMENT_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
            </div>
            <div>
              <label style={inputLabelStyle}>Summary</label>
              <textarea value={formSummary} onChange={(e) => setFormSummary(e.target.value)} rows={2} className="w-full" placeholder="Describe the submission..." />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!formSummary.trim()}
              className="px-6 py-2 text-sm rounded-md border font-medium"
              style={{
                background: formSummary.trim() ? "linear-gradient(135deg, var(--gold-dim), var(--gold))" : "var(--bg-tertiary)",
                color: formSummary.trim() ? "var(--void)" : "var(--text-ghost)",
                borderColor: "var(--gold)",
              }}
            >
              Add Submission
            </button>
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["ID", "Date", "Submitter", "Category", "Summary", "Status", "Sentiment"].map((h) => (
                  <th key={h} style={{ fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold-dim)", padding: "8px 8px", textAlign: "left" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px", fontSize: 12, fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", color: "var(--gold)" }}>{s.id}</td>
                  <td style={{ padding: "8px", fontSize: 12, color: "var(--text-ghost)" }}>{s.date}</td>
                  <td style={{ padding: "8px", fontSize: 12, color: "var(--text-primary)" }}>{s.submitter}</td>
                  <td style={{ padding: "8px", fontSize: 12, color: "var(--text-secondary)" }}>{s.category}</td>
                  <td style={{ padding: "8px", fontSize: 12, color: "var(--text-secondary)", maxWidth: 300 }}>
                    <span className="line-clamp-2">{s.summary}</span>
                  </td>
                  <td style={{ padding: "8px" }}>
                    <span style={{ fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", fontSize: 10, padding: "2px 8px", borderRadius: 4, color: STATUS_COLORS[s.status], background: `${STATUS_COLORS[s.status]}18`, border: `1px solid ${STATUS_COLORS[s.status]}40`, whiteSpace: "nowrap" }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: "8px" }}>
                    <span style={{ fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", fontSize: 10, padding: "2px 8px", borderRadius: 4, color: SENTIMENT_COLORS[s.sentiment], background: `${SENTIMENT_COLORS[s.sentiment]}18`, border: `1px solid ${SENTIMENT_COLORS[s.sentiment]}40` }}>
                      {s.sentiment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Myth Buster */}
      <div style={{ background: "var(--carbon)", border: "1px solid var(--border)", borderRadius: 8, padding: 20 }}>
        <p style={cardLabelStyle}>Myth Buster</p>
        <div className="space-y-3">
          {SAMPLE_MYTHS.map((m, i) => (
            <div key={i} style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
              <div className="flex gap-3 mb-2">
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, color: "#DC2626", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", letterSpacing: 1, flexShrink: 0, height: "fit-content" }}>
                  MYTH
                </span>
                <p style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{m.claim}</p>
              </div>
              <div className="flex gap-3 mb-2">
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, color: "#059669", background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.3)", fontFamily: "var(--font-jetbrains, 'PT Mono', monospace)", letterSpacing: 1, flexShrink: 0, height: "fit-content" }}>
                  FACT
                </span>
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{m.fact}</p>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-ghost)", marginLeft: 52 }}>Source: {m.source}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
