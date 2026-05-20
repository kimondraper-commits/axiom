"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ArrowPosition = { left: number; width: number; top: number };
type ReplanPath = {
  d: string;
  endX: number;
  endY: number;
  dropY: number;
  startX: number;
  canvasWidth: number;
  canvasHeight: number;
};

type Agent = {
  id: string;
  color: "blue" | "green" | "amber" | "violet";
  stageNum: string;
  stageLabel: string;
  name: string;
  role: string;
  glyph: ReactNode;
  sectionTitle: string;
  sectionCount: string;
  items: { kind: "tool" | "output" | "check"; name: string; hint: string }[];
  footerLeft: string;
  footerRight: ReactNode;
};

const AGENTS: Agent[] = [
  {
    id: "01",
    color: "blue",
    stageNum: "01",
    stageLabel: "Intake & decomposition",
    name: "Planner",
    role:
      "Receives the user's question and breaks it into a numbered plan of sub-tasks the rest of the pipeline can act on.",
    glyph: (
      <svg viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.3" />
        <rect x="11" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.3" />
        <rect x="3" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.3" />
        <rect x="11" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.3" />
        <path d="M9 6h2M9 14h2M6 9v2M14 9v2" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
    sectionTitle: "Produces",
    sectionCount: "04",
    items: [
      { kind: "output", name: "Intent classification", hint: "enum" },
      { kind: "output", name: "Ordered sub-task list", hint: "1..n" },
      { kind: "output", name: "Required data sources", hint: "ref" },
      { kind: "output", name: "Success criteria", hint: "ctx" },
    ],
    footerLeft: "Input · free text",
    footerRight: (
      <>
        <strong>~2s</strong> budget
      </>
    ),
  },
  {
    id: "02",
    color: "green",
    stageNum: "02",
    stageLabel: "Evidence gathering",
    name: "Researcher",
    role:
      "Calls NSW planning data tools in parallel, pulls evidence back, and normalises it into a single research payload.",
    glyph: (
      <svg viewBox="0 0 20 20" fill="none">
        <circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M13 13 L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
        <path d="M9 6v6 M6 9h6" stroke="currentColor" strokeWidth="1.1" />
      </svg>
    ),
    sectionTitle: "Tools connected",
    sectionCount: "06",
    items: [
      { kind: "tool", name: "Planning glossary", hint: "t/01" },
      { kind: "tool", name: "Council profiles", hint: "t/02" },
      { kind: "tool", name: "Planning instruments", hint: "t/03" },
      { kind: "tool", name: "Growth area tracker", hint: "t/04" },
      { kind: "tool", name: "DA metrics", hint: "t/05" },
      { kind: "tool", name: "Infrastructure · VPA", hint: "t/06" },
    ],
    footerLeft: "Parallel fetch",
    footerRight: (
      <>
        <strong>6 → 1</strong> payload
      </>
    ),
  },
  {
    id: "03",
    color: "amber",
    stageNum: "03",
    stageLabel: "Structured synthesis",
    name: "Coder",
    role:
      "Turns the research payload into the final deliverable — a formatted report, side-by-side comparison, or short summary.",
    glyph: (
      <svg viewBox="0 0 20 20" fill="none">
        <path
          d="M7 5 L3 10 L7 15"
          stroke="currentColor"
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <path
          d="M13 5 L17 10 L13 15"
          stroke="currentColor"
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <path d="M11 4 L9 16" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
    sectionTitle: "Output formats",
    sectionCount: "04",
    items: [
      { kind: "output", name: "Council comparison report", hint: ".md" },
      { kind: "output", name: "Site-specific brief", hint: ".md" },
      { kind: "output", name: "Metric summary table", hint: ".csv" },
      { kind: "output", name: "Plain-English answer", hint: "txt" },
    ],
    footerLeft: "Cited evidence",
    footerRight: (
      <>
        <strong>100%</strong> traceable
      </>
    ),
  },
  {
    id: "04",
    color: "violet",
    stageNum: "04",
    stageLabel: "Policy verification",
    name: "Reviewer",
    role:
      "Cross-checks the draft against planning policy and the original brief, flags gaps, and signs off — or sends it back.",
    glyph: (
      <svg viewBox="0 0 20 20" fill="none">
        <path
          d="M10 2 L17 5 V10 C17 14 13.5 17 10 18 C6.5 17 3 14 3 10 V5 Z"
          stroke="currentColor"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M6.5 10 L9 12.5 L13.5 7.5"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="square"
        />
      </svg>
    ),
    sectionTitle: "Checks performed",
    sectionCount: "04",
    items: [
      { kind: "check", name: "Policy alignment", hint: "threshold" },
      { kind: "check", name: "Citation coverage", hint: "≥ 90%" },
      { kind: "check", name: "Answers the brief", hint: "binary" },
      { kind: "check", name: "Known data gaps", hint: "flagged" },
    ],
    footerLeft: "Verdict",
    footerRight: <strong>Approve · Revise · Escalate</strong>,
  },
];

type Handoff = {
  id: number;
  shortLabel: string;
  header: string;
  title: string;
  body: string;
  schema: ReactNode;
};

const HANDOFFS: Handoff[] = [
  {
    id: 1,
    shortLabel: "User query · plan",
    header: "Handoff · 01 → 02",
    title: "User query & structured plan",
    body:
      "The Planner passes the original question plus a numbered list of sub-tasks. Each sub-task names which NSW tools the Researcher should call and what must come back.",
    schema: (
      <>
        <span className="c">{`// handoff payload`}</span>
        {`\n{\n  `}
        <span className="k">{`"query"`}</span>
        {`: `}
        <span className="s">{`"Compare DA approval times — Ryde vs Parramatta"`}</span>
        {`,\n  `}
        <span className="k">{`"intent"`}</span>
        {`: `}
        <span className="s">{`"council_comparison"`}</span>
        {`,\n  `}
        <span className="k">{`"subtasks"`}</span>
        {`: [\n    { `}
        <span className="k">{`"id"`}</span>
        {`: `}
        <span className="s">{`"t1"`}</span>
        {`, `}
        <span className="k">{`"tool"`}</span>
        {`: `}
        <span className="s">{`"council_profiles"`}</span>
        {` },\n    { `}
        <span className="k">{`"id"`}</span>
        {`: `}
        <span className="s">{`"t2"`}</span>
        {`, `}
        <span className="k">{`"tool"`}</span>
        {`: `}
        <span className="s">{`"da_metrics"`}</span>
        {` }\n  ],\n  `}
        <span className="k">{`"success_criteria"`}</span>
        {`: [`}
        <span className="s">{`"median_days"`}</span>
        {`, `}
        <span className="s">{`"volume"`}</span>
        {`]\n}`}
      </>
    ),
  },
  {
    id: 2,
    shortLabel: "Research payload",
    header: "Handoff · 02 → 03",
    title: "Normalised research payload",
    body:
      "The Researcher merges 1–6 tool responses into one payload. Every value carries its source tool and a confidence score, so the Coder can cite as it writes.",
    schema: (
      <>
        <span className="c">{`// research payload`}</span>
        {`\n{\n  `}
        <span className="k">{`"findings"`}</span>
        {`: [\n    { `}
        <span className="k">{`"metric"`}</span>
        {`: `}
        <span className="s">{`"median_da_days"`}</span>
        {`,\n      `}
        <span className="k">{`"value"`}</span>
        {`: `}
        <span className="s">{`"78"`}</span>
        {`,\n      `}
        <span className="k">{`"lga"`}</span>
        {`: `}
        <span className="s">{`"Ryde"`}</span>
        {`,\n      `}
        <span className="k">{`"source"`}</span>
        {`: `}
        <span className="s">{`"da_metrics"`}</span>
        {`,\n      `}
        <span className="k">{`"confidence"`}</span>
        {`: `}
        <span className="s">{`"high"`}</span>
        {` }\n  ],\n  `}
        <span className="k">{`"glossary"`}</span>
        {`: [ `}
        <span className="s">{`"VPA"`}</span>
        {`, `}
        <span className="s">{`"SEPP"`}</span>
        {` ],\n  `}
        <span className="k">{`"gaps"`}</span>
        {`: []\n}`}
      </>
    ),
  },
  {
    id: 3,
    shortLabel: "Draft & citations",
    header: "Handoff · 03 → 04",
    title: "Drafted deliverable with citations",
    body:
      "The Coder hands the Reviewer a finished draft plus a citation map linking every claim back to a tool result. The Reviewer returns an approval, a revise list, or an escalation.",
    schema: (
      <>
        <span className="c">{`// draft → reviewer`}</span>
        {`\n{\n  `}
        <span className="k">{`"format"`}</span>
        {`: `}
        <span className="s">{`"council_comparison"`}</span>
        {`,\n  `}
        <span className="k">{`"body"`}</span>
        {`: `}
        <span className="s">{`"# Ryde vs Parramatta \\n …"`}</span>
        {`,\n  `}
        <span className="k">{`"citations"`}</span>
        {`: {\n    `}
        <span className="k">{`"c1"`}</span>
        {`: `}
        <span className="s">{`"da_metrics#ryde-2025"`}</span>
        {`,\n    `}
        <span className="k">{`"c2"`}</span>
        {`: `}
        <span className="s">{`"council_profiles#parramatta"`}</span>
        {`\n  },\n  `}
        <span className="k">{`"open_questions"`}</span>
        {`: [ `}
        <span className="s">{`"VPA coverage"`}</span>
        {` ]\n}`}
      </>
    ),
  },
];

export default function PipelineDiagram() {
  const [openArrow, setOpenArrow] = useState<number | null>(null);
  const [isWide, setIsWide] = useState(false);
  const [arrowPositions, setArrowPositions] = useState<ArrowPosition[]>([]);
  const [replanPath, setReplanPath] = useState<ReplanPath | null>(null);

  const canvasRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    function recalc() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const wide = window.innerWidth > 1200;
      setIsWide(wide);
      if (!wide) {
        setArrowPositions([]);
        setReplanPath(null);
        return;
      }
      const rects = cardRefs.current.map((c) => c?.getBoundingClientRect());
      if (rects.length !== 4 || rects.some((r) => !r)) return;
      const canvasRect = canvas.getBoundingClientRect();
      const first = rects[0]!;
      const top = first.top - canvasRect.top + first.height / 2 - 19;
      const positions: ArrowPosition[] = [];
      for (let i = 0; i < 3; i++) {
        const left = rects[i]!;
        const right = rects[i + 1]!;
        positions.push({
          left: left.right - canvasRect.left,
          width: right.left - left.right,
          top,
        });
      }
      setArrowPositions(positions);

      const planner = rects[0]!;
      const reviewer = rects[3]!;
      const startX = reviewer.left + reviewer.width / 2 - canvasRect.left;
      const startY = reviewer.bottom - canvasRect.top;
      const endX = planner.left + planner.width / 2 - canvasRect.left;
      const endY = planner.bottom - canvasRect.top;
      const dropY = Math.max(startY, endY) + 36;
      setReplanPath({
        d: `M ${startX} ${startY} V ${dropY} H ${endX} V ${endY + 2}`,
        endX,
        endY,
        dropY,
        startX,
        canvasWidth: canvasRect.width,
        canvasHeight: canvasRect.height + 60,
      });
    }
    recalc();
    window.addEventListener("resize", recalc);
    const ro = new ResizeObserver(recalc);
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => {
      window.removeEventListener("resize", recalc);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const close = () => setOpenArrow(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <div className="axiom-pipeline">
      <style>{STYLES}</style>

      <div className="frame">
        <header className="titlebar">
          <div className="titlebar-left">
            <div className="mark">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 20 L12 4 L20 20 M7.5 14 L16.5 14"
                  stroke="#2b5cd1"
                  strokeWidth="1.8"
                  strokeLinecap="square"
                />
              </svg>
            </div>
            <h1>
              AXIOM
              <span className="muted">Multi-agent planning pipeline</span>
            </h1>
          </div>
          <div className="titlebar-right">
            <span>
              <span className="dot" />
              Pipeline nominal
            </span>
            <span className="sep" />
            <span>REV · 04 · 2026</span>
            <span className="sep" />
            <span>NSW · AU</span>
          </div>
        </header>

        <div className="endpoint-layer top">
          <div className="endpoints-row top">
            <div className="endpoint-slot wide">
              <div className="endpoint filled">
                <div className="ep-glyph">
                  <svg viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="7" r="3.2" stroke="#2b5cd1" strokeWidth="1.4" />
                    <path
                      d="M3.5 17 C4.5 13.5 7 12 10 12 C13 12 15.5 13.5 16.5 17"
                      stroke="#2b5cd1"
                      strokeWidth="1.4"
                      fill="none"
                      strokeLinecap="square"
                    />
                  </svg>
                </div>
                <div className="ep-body">
                  <span className="ep-kind">Human · Input</span>
                  <span className="ep-name">Council planner</span>
                  <span className="ep-desc">
                    &ldquo;Compare DA approval times across Bayside, Woollahra and Waverley.&rdquo;
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="connector" />
        </div>

        <main className="canvas" ref={canvasRef}>
          {AGENTS.map((agent, i) => (
            <div key={agent.id} className="stage-col">
              <div className="stage-tag">
                <span className="num">{agent.stageNum}</span>
                <span>{agent.stageLabel}</span>
                <span className="rule" />
              </div>
              <div
                className="card"
                data-color={agent.color}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
              >
                <span className="corner-tl" />
                <span className="corner-br" />
                <div className="card-head">
                  <div>
                    <span className="agent-id">Agent · {agent.id}</span>
                    <div className="agent-name" style={{ marginTop: 10 }}>
                      {agent.name}
                    </div>
                  </div>
                  <div className="agent-glyph">{agent.glyph}</div>
                </div>
                <p className="agent-role">{agent.role}</p>

                <div className="section-head">
                  <span>{agent.sectionTitle}</span>
                  <span className="count">· {agent.sectionCount}</span>
                </div>
                <ul className="item-list">
                  {agent.items.map((it) => (
                    <li key={it.name} className={`item ${it.kind}`}>
                      <span className="marker" />
                      {it.name}
                      <span className="hint">{it.hint}</span>
                    </li>
                  ))}
                </ul>

                <div className="card-footer">
                  <span>{agent.footerLeft}</span>
                  <span className="metric">{agent.footerRight}</span>
                </div>
              </div>
            </div>
          ))}

          {isWide && (
            <div
              className="flow-row"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: arrowPositions[0]?.top ?? 0,
                height: 38,
                pointerEvents: "none",
                display: "block",
              }}
            >
              {HANDOFFS.map((h, i) => {
                const pos = arrowPositions[i];
                if (!pos) return null;
                const isOpen = openArrow === h.id;
                return (
                  <button
                    key={h.id}
                    className={`arrow${isOpen ? " open" : ""}`}
                    type="button"
                    aria-expanded={isOpen}
                    style={{
                      position: "absolute",
                      left: pos.left,
                      width: pos.width,
                      top: 0,
                      height: 38,
                      pointerEvents: "auto",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenArrow((prev) => (prev === h.id ? null : h.id));
                    }}
                  >
                    <div className="arrow-track">
                      <div className="arrow-line" />
                      <div className="arrow-head" />
                      <span className="arrow-label">
                        {h.shortLabel}
                        <span className="plus">+</span>
                      </span>
                    </div>
                    <div
                      className="arrow-panel"
                      role="dialog"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h4>{h.header}</h4>
                      <div className="panel-title">{h.title}</div>
                      <p className="panel-body">{h.body}</p>
                      <div className="panel-schema">{h.schema}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {isWide && replanPath && (
            <svg
              id="replan-loop"
              width={replanPath.canvasWidth}
              height={replanPath.canvasHeight}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                pointerEvents: "none",
                overflow: "visible",
                zIndex: 5,
              }}
            >
              <path
                d={replanPath.d}
                fill="none"
                stroke="#b4761a"
                strokeWidth="1.5"
                strokeDasharray="4 5"
              />
              <path
                d={`M ${replanPath.endX - 5} ${replanPath.endY + 8} L ${replanPath.endX} ${replanPath.endY + 2} L ${replanPath.endX + 5} ${replanPath.endY + 8}`}
                fill="none"
                stroke="#b4761a"
                strokeWidth="1.5"
              />
              <foreignObject
                x={(replanPath.startX + replanPath.endX) / 2 - 70}
                y={replanPath.dropY - 12}
                width={140}
                height={24}
              >
                <div className="replan-label">Verdict · revise</div>
              </foreignObject>
            </svg>
          )}
        </main>

        <div className="endpoint-layer bottom">
          <div className="connector up" />
          <div
            className="endpoints-row bottom"
            style={{
              gridTemplateColumns: "1fr auto 1fr",
              gap: 24,
              alignItems: "center",
            }}
          >
            <div className="endpoint-slot right">
              <div className="endpoint">
                <div className="ep-glyph">
                  <svg viewBox="0 0 20 20" fill="none">
                    <circle cx="7" cy="7" r="3" stroke="#2b5cd1" strokeWidth="1.4" />
                    <path
                      d="M2 17 C3 13.5 5 12.5 7 12.5 C9 12.5 11 13.5 12 17"
                      stroke="#2b5cd1"
                      strokeWidth="1.4"
                      fill="none"
                      strokeLinecap="square"
                    />
                    <path
                      d="M14 8 L17 11 L14 14"
                      stroke="#2b5cd1"
                      strokeWidth="1.4"
                      fill="none"
                      strokeLinecap="square"
                    />
                    <path d="M12 11 H17" stroke="#2b5cd1" strokeWidth="1.4" />
                  </svg>
                </div>
                <div className="ep-body">
                  <span className="ep-kind">Human · Sign-off</span>
                  <span className="ep-name">Council planner</span>
                  <span className="ep-desc">
                    Reviews the draft, accepts, edits, or asks the pipeline for another pass.
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 1.5,
                  background:
                    "repeating-linear-gradient(90deg, var(--accent) 0 5px, transparent 5px 9px)",
                }}
              />
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                  borderLeft: "8px solid var(--accent)",
                }}
              />
            </div>

            <div className="endpoint-slot left">
              <div className="endpoint filled">
                <div className="ep-glyph">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path
                      d="M5 2 H12 L16 6 V18 H5 Z"
                      stroke="#2b5cd1"
                      strokeWidth="1.4"
                      fill="none"
                    />
                    <path
                      d="M12 2 V6 H16"
                      stroke="#2b5cd1"
                      strokeWidth="1.4"
                      fill="none"
                    />
                    <path
                      d="M7.5 10 H13.5 M7.5 13 H13.5 M7.5 15.5 H11"
                      stroke="#2b5cd1"
                      strokeWidth="1.1"
                    />
                  </svg>
                </div>
                <div className="ep-body">
                  <span className="ep-kind">Output · Final</span>
                  <span className="ep-name">Signed deliverable</span>
                  <span className="ep-desc">
                    Report, comparison, or summary landing back with the planner — fully cited.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="legend">
          <div className="legend-items">
            <span className="legend-label">Legend</span>
            <span className="leg">
              <span className="swatch agent" />
              Agent step
            </span>
            <span className="leg">
              <span className="swatch tool" />
              Tool call
            </span>
            <span className="leg">
              <span className="swatch output" />
              Generated output
            </span>
            <span className="leg">
              <span className="swatch check" />
              Review check
            </span>
            <span className="leg">
              <span className="swatch flow" />
              Data flow
            </span>
            <span className="leg">
              <span className="swatch cta" />
              Click handoff to expand
            </span>
          </div>
          <div className="legend-meta">
            <span>Left → right</span>
            <span className="legend-sep" />
            <span>Async + parallel at step 02</span>
            <span className="legend-sep" />
            <span>Human-in-the-loop sign-off</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

const STYLES = `
.axiom-pipeline {
  --paper: #f6f7f4;
  --paper-soft: #eef0ec;
  --surface: #ffffff;
  --surface-hover: #fafbf8;
  --ink: #0d1220;
  --ink-2: #2a3244;
  --ink-3: #5b6478;
  --ink-4: #8c95a6;
  --ink-5: #c4cad4;
  --accent: #2b5cd1;
  --accent-bright: #3b82f6;
  --accent-soft: #e6edfb;
  --accent-line: rgba(43, 92, 209, 0.22);
  --accent-glow: rgba(43, 92, 209, 0.08);
  --teal: #0f8a7e;
  --teal-soft: #dff2ef;
  --amber: #b4761a;
  --amber-soft: #f7ecd5;
  --rose: #b5394a;
  --rose-soft: #f7dde1;
  --grid: rgba(43, 92, 209, 0.07);
  --grid-fine: rgba(43, 92, 209, 0.035);
  --border: #e3e5df;
  --border-strong: #cdd1c8;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-plus-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  position: relative;
  min-height: 100vh;
}
.axiom-pipeline *,
.axiom-pipeline *::before,
.axiom-pipeline *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.axiom-pipeline::before {
  content: '';
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size: 80px 80px;
}
.axiom-pipeline::after {
  content: '';
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(var(--grid-fine) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-fine) 1px, transparent 1px);
  background-size: 16px 16px;
}

.axiom-pipeline .frame {
  position: relative; z-index: 1;
  display: flex; flex-direction: column;
  padding: 28px 36px 28px;
}

.axiom-pipeline .titlebar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 26px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  box-shadow: 0 1px 0 rgba(13,18,32,0.02);
}
.axiom-pipeline .titlebar-left { display: flex; align-items: center; gap: 18px; }
.axiom-pipeline .mark {
  width: 34px; height: 34px;
  border: 1.5px solid var(--accent);
  border-radius: 4px;
  display: grid; place-items: center;
  background: var(--accent-soft);
}
.axiom-pipeline .mark svg { width: 18px; height: 18px; }
.axiom-pipeline .titlebar h1 {
  font-family: var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif;
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--ink);
}
.axiom-pipeline .titlebar h1 .muted {
  color: var(--ink-3);
  font-weight: 400;
  letter-spacing: 1.5px;
  text-transform: none;
  font-family: var(--font-plus-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 14px;
  margin-left: 12px;
  padding-left: 14px;
  border-left: 1px solid var(--border-strong);
}
.axiom-pipeline .titlebar-right {
  display: flex; align-items: center; gap: 20px;
  font-family: var(--font-ibm-mono), 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--ink-3);
}
.axiom-pipeline .titlebar-right .dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--teal);
  box-shadow: 0 0 0 3px var(--teal-soft);
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
  animation: axiom-pulse 2.4s ease-in-out infinite;
}
@keyframes axiom-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
.axiom-pipeline .titlebar-right .sep {
  width: 1px; height: 14px; background: var(--border-strong);
}

.axiom-pipeline .canvas {
  flex: 1;
  margin-top: 28px;
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  align-items: stretch;
}
.axiom-pipeline .stage-col {
  position: relative;
  padding: 0 14px;
  display: flex; flex-direction: column;
}
.axiom-pipeline .stage-tag {
  font-family: var(--font-ibm-mono), 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--ink-4);
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 14px;
  padding-left: 2px;
}
.axiom-pipeline .stage-tag .num { color: var(--accent); font-weight: 500; }
.axiom-pipeline .stage-tag .rule {
  flex: 1; height: 1px;
  background: repeating-linear-gradient(90deg, var(--ink-5) 0 4px, transparent 4px 8px);
}

.axiom-pipeline .card {
  --card-accent: var(--accent);
  --card-accent-soft: var(--accent-soft);
  --card-accent-line: var(--accent-line);
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  padding: 22px 22px 20px;
  position: relative;
  display: flex; flex-direction: column;
  transition: all 0.25s ease;
  flex: 1;
  min-height: 380px;
}
.axiom-pipeline .card[data-color="blue"]   { --card-accent: #2b5cd1; --card-accent-soft: #e6edfb; --card-accent-line: rgba(43,92,209,0.28); }
.axiom-pipeline .card[data-color="green"]  { --card-accent: #0f8a5c; --card-accent-soft: #dff1e8; --card-accent-line: rgba(15,138,92,0.28); }
.axiom-pipeline .card[data-color="amber"]  { --card-accent: #b4761a; --card-accent-soft: #f7ecd5; --card-accent-line: rgba(180,118,26,0.30); }
.axiom-pipeline .card[data-color="violet"] { --card-accent: #6b42c7; --card-accent-soft: #ece4fa; --card-accent-line: rgba(107,66,199,0.30); }
.axiom-pipeline .card:hover {
  border-color: var(--card-accent);
  box-shadow: 0 8px 32px -12px color-mix(in srgb, var(--card-accent) 28%, transparent), 0 0 0 1px var(--card-accent-line);
  transform: translateY(-2px);
}
.axiom-pipeline .card::before,
.axiom-pipeline .card::after,
.axiom-pipeline .card > .corner-tl,
.axiom-pipeline .card > .corner-br {
  content: '';
  position: absolute;
  width: 10px; height: 10px;
  border-color: var(--card-accent);
  border-style: solid;
  border-width: 0;
}
.axiom-pipeline .card::before { top: -1px; left: -1px; border-top-width: 1.5px; border-left-width: 1.5px; }
.axiom-pipeline .card::after  { top: -1px; right: -1px; border-top-width: 1.5px; border-right-width: 1.5px; }
.axiom-pipeline .card .corner-tl { bottom: -1px; left: -1px; border-bottom-width: 1.5px; border-left-width: 1.5px; }
.axiom-pipeline .card .corner-br { bottom: -1px; right: -1px; border-bottom-width: 1.5px; border-right-width: 1.5px; }

.axiom-pipeline .card-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.axiom-pipeline .agent-id {
  font-family: var(--font-ibm-mono), 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--card-accent);
  padding: 3px 7px;
  background: var(--card-accent-soft);
  border-radius: 3px;
  white-space: nowrap;
  display: inline-block;
}
.axiom-pipeline .agent-glyph {
  width: 36px; height: 36px;
  border: 1px solid var(--card-accent-line);
  border-radius: 4px;
  display: grid; place-items: center;
  background: var(--card-accent-soft);
  color: var(--card-accent);
  flex-shrink: 0;
}
.axiom-pipeline .agent-glyph svg { width: 18px; height: 18px; }
.axiom-pipeline .agent-name {
  font-family: var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: -0.2px;
  line-height: 1.1;
  margin-bottom: 6px;
}
.axiom-pipeline .agent-role {
  font-size: 13px;
  color: var(--ink-3);
  line-height: 1.5;
  margin-bottom: 18px;
  text-wrap: pretty;
}
.axiom-pipeline .section-head {
  font-family: var(--font-ibm-mono), 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--ink-4);
  margin-bottom: 10px;
  display: flex; align-items: center; gap: 8px;
}
.axiom-pipeline .section-head .count { color: var(--card-accent); font-weight: 500; }

.axiom-pipeline .item-list {
  list-style: none;
  display: flex; flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
.axiom-pipeline .item {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 10px;
  background: var(--paper-soft);
  border: 1px solid transparent;
  border-radius: 3px;
  font-size: 12.5px;
  color: var(--ink-2);
  transition: all 0.15s;
  line-height: 1.3;
}
.axiom-pipeline .item:hover {
  background: var(--card-accent-soft);
  border-color: var(--card-accent-line);
  color: var(--ink);
}
.axiom-pipeline .item .marker {
  width: 6px; height: 6px;
  background: var(--card-accent);
  flex-shrink: 0;
  transform: rotate(45deg);
  opacity: 0.75;
}
.axiom-pipeline .item.tool .marker   { border-radius: 50%; transform: none; }
.axiom-pipeline .item.output .marker { transform: none; border-radius: 1px; }
.axiom-pipeline .item.check .marker  { clip-path: polygon(50% 0, 100% 100%, 0 100%); transform: none; }
.axiom-pipeline .item .hint {
  margin-left: auto;
  font-family: var(--font-ibm-mono), 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  color: var(--ink-4);
  letter-spacing: 0.5px;
}

.axiom-pipeline .card-footer {
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px dashed var(--border-strong);
  display: flex; align-items: center; justify-content: space-between;
  font-family: var(--font-ibm-mono), 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--ink-4);
}
.axiom-pipeline .card-footer .metric strong { color: var(--ink-2); font-weight: 500; }

.axiom-pipeline .flow-row {
  position: relative;
  height: 56px;
  margin: 18px 0 6px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0;
}
.axiom-pipeline .arrow {
  position: relative;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  padding: 0 8px;
  background: transparent;
  border: none;
  font-family: inherit;
}
.axiom-pipeline .arrow-track {
  position: relative;
  width: 100%;
  height: 38px;
  display: flex; align-items: center;
}
.axiom-pipeline .arrow-line {
  flex: 1;
  height: 1.5px;
  background: repeating-linear-gradient(90deg, var(--accent) 0 8px, transparent 8px 12px);
  position: relative;
}
.axiom-pipeline .arrow-head {
  width: 0; height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 9px solid var(--accent);
  margin-left: -2px;
}
.axiom-pipeline .arrow-label {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--surface);
  border: 1px solid var(--accent-line);
  border-radius: 3px;
  padding: 5px 12px 5px 10px;
  font-family: var(--font-ibm-mono), 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--ink-2);
  white-space: nowrap;
  display: flex; align-items: center; gap: 8px;
  transition: all 0.2s;
  cursor: pointer;
}
.axiom-pipeline .arrow-label .plus {
  width: 14px; height: 14px;
  border: 1px solid var(--accent);
  border-radius: 2px;
  display: grid; place-items: center;
  color: var(--accent);
  font-size: 10px;
  line-height: 1;
  background: var(--accent-soft);
  transition: all 0.2s;
}
.axiom-pipeline .arrow:hover .arrow-label {
  border-color: var(--accent);
  background: var(--accent-soft);
  box-shadow: 0 4px 12px -4px rgba(43, 92, 209, 0.3);
}
.axiom-pipeline .arrow:hover .arrow-label .plus { background: var(--accent); color: white; }
.axiom-pipeline .arrow.open .arrow-label .plus {
  background: var(--accent);
  color: white;
  transform: rotate(45deg);
}

.axiom-pipeline .arrow-panel {
  position: absolute;
  top: 48px;
  left: 50%;
  transform: translateX(-50%) translateY(-6px);
  width: 340px;
  max-width: 90vw;
  background: var(--surface);
  border: 1px solid var(--accent-line);
  border-radius: 6px;
  box-shadow: 0 18px 50px -12px rgba(13, 18, 32, 0.22), 0 0 0 1px rgba(43, 92, 209, 0.04);
  padding: 18px 20px 18px;
  text-align: left;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease;
  z-index: 30;
}
.axiom-pipeline .arrow-panel::before {
  content: '';
  position: absolute;
  top: -7px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 12px; height: 12px;
  background: var(--surface);
  border-left: 1px solid var(--accent-line);
  border-top: 1px solid var(--accent-line);
}
.axiom-pipeline .arrow.open .arrow-panel {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(-50%) translateY(0);
}
.axiom-pipeline .arrow-panel h4 {
  font-family: var(--font-ibm-mono), 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 4px;
}
.axiom-pipeline .arrow-panel .panel-title {
  font-family: var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 10px;
  letter-spacing: -0.1px;
}
.axiom-pipeline .arrow-panel .panel-body {
  font-size: 13px;
  color: var(--ink-2);
  line-height: 1.55;
  margin-bottom: 14px;
  text-wrap: pretty;
}
.axiom-pipeline .arrow-panel .panel-schema {
  background: var(--paper-soft);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 10px 12px;
  font-family: var(--font-ibm-mono), 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  line-height: 1.6;
  color: var(--ink-2);
  white-space: pre-wrap;
}
.axiom-pipeline .arrow-panel .panel-schema .k { color: var(--accent); }
.axiom-pipeline .arrow-panel .panel-schema .s { color: var(--teal); }
.axiom-pipeline .arrow-panel .panel-schema .c { color: var(--ink-4); }

.axiom-pipeline .legend {
  margin-top: 32px;
  padding: 20px 26px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}
.axiom-pipeline .legend-label {
  font-family: var(--font-ibm-mono), 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--ink-4);
  margin-right: 4px;
}
.axiom-pipeline .legend-items {
  display: flex; align-items: center;
  gap: 22px;
  flex-wrap: wrap;
}
.axiom-pipeline .leg {
  display: flex; align-items: center; gap: 9px;
  font-size: 12px;
  color: var(--ink-2);
}
.axiom-pipeline .leg .swatch { width: 10px; height: 10px; flex-shrink: 0; }
.axiom-pipeline .leg .swatch.agent  { background: var(--accent); transform: rotate(45deg); opacity: 0.7; }
.axiom-pipeline .leg .swatch.tool   { background: var(--teal); border-radius: 50%; }
.axiom-pipeline .leg .swatch.output { background: var(--amber); border-radius: 1px; }
.axiom-pipeline .leg .swatch.check  { background: var(--rose); clip-path: polygon(50% 0, 100% 100%, 0 100%); }
.axiom-pipeline .leg .swatch.flow {
  width: 22px; height: 1.5px;
  background: repeating-linear-gradient(90deg, var(--accent) 0 4px, transparent 4px 6px);
  transform: none;
}
.axiom-pipeline .leg .swatch.cta {
  width: 14px; height: 14px;
  border: 1px solid var(--accent);
  border-radius: 2px;
  background: var(--accent-soft);
  display: grid; place-items: center;
  color: var(--accent);
  font-size: 9px;
  line-height: 1;
}
.axiom-pipeline .leg .swatch.cta::before { content: '+'; font-weight: 600; }
.axiom-pipeline .legend-meta {
  font-family: var(--font-ibm-mono), 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--ink-4);
  display: flex; align-items: center; gap: 10px;
}
.axiom-pipeline .legend-sep {
  width: 1px; height: 10px;
  background: var(--border-strong);
  display: inline-block;
}

.axiom-pipeline .endpoints-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: stretch;
  margin-top: 22px;
}
.axiom-pipeline .endpoints-row.top { margin-top: 18px; margin-bottom: 6px; }
.axiom-pipeline .endpoints-row.bottom { margin-top: 6px; margin-bottom: 8px; }
.axiom-pipeline .endpoint-slot { padding: 0 14px; display: flex; }
.axiom-pipeline .endpoint-slot.wide { grid-column: span 4; justify-content: center; }
.axiom-pipeline .endpoint-slot.left { justify-content: flex-start; }
.axiom-pipeline .endpoint-slot.right { justify-content: flex-end; }

.axiom-pipeline .endpoint {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 20px;
  background: var(--surface);
  border: 1.5px dashed var(--accent);
  border-radius: 6px;
  min-width: 260px;
  max-width: 360px;
  position: relative;
}
.axiom-pipeline .endpoint.filled {
  border-style: solid;
  background: var(--accent-soft);
  border-color: var(--accent);
}
.axiom-pipeline .endpoint .ep-glyph {
  width: 40px; height: 40px;
  background: var(--paper);
  border: 1px solid var(--accent-line);
  border-radius: 50%;
  display: grid; place-items: center;
  flex-shrink: 0;
}
.axiom-pipeline .endpoint.filled .ep-glyph { background: var(--surface); }
.axiom-pipeline .endpoint .ep-glyph svg { width: 20px; height: 20px; }
.axiom-pipeline .endpoint .ep-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.axiom-pipeline .endpoint .ep-kind {
  font-family: var(--font-ibm-mono), 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--accent);
  font-weight: 500;
}
.axiom-pipeline .endpoint .ep-name {
  font-family: var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: -0.1px;
}
.axiom-pipeline .endpoint .ep-desc {
  font-size: 12px;
  color: var(--ink-3);
  line-height: 1.4;
  text-wrap: pretty;
}
.axiom-pipeline .connector {
  display: flex; justify-content: center;
  height: 22px;
  position: relative;
}
.axiom-pipeline .connector::before {
  content: '';
  width: 1.5px;
  height: 100%;
  background: repeating-linear-gradient(180deg, var(--accent) 0 5px, transparent 5px 9px);
}
.axiom-pipeline .connector::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid var(--accent);
}
.axiom-pipeline .connector.up::after {
  bottom: auto; top: -1px;
  border-top: none;
  border-bottom: 8px solid var(--accent);
}

.axiom-pipeline .replan-label {
  font-family: var(--font-ibm-mono), 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #b4761a;
  background: #f7ecd5;
  border: 1px solid rgba(180,118,26,0.35);
  border-radius: 3px;
  padding: 3px 8px;
  text-align: center;
  width: fit-content;
  margin: 0 auto;
}

@media (max-width: 1200px) {
  .axiom-pipeline .canvas { grid-template-columns: 1fr; gap: 28px; }
  .axiom-pipeline .flow-row { display: none !important; }
  .axiom-pipeline .stage-col { padding: 0; }
  .axiom-pipeline .card { min-height: auto; }
  .axiom-pipeline .endpoints-row { grid-template-columns: 1fr !important; }
  .axiom-pipeline .endpoint-slot { padding: 0; justify-content: center !important; }
}
`;
