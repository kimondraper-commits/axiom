"use client";

import { useState } from "react";
import Link from "next/link";
import { OverviewTab } from "./tabs/overview-tab";
import { DocumentsTab } from "./tabs/documents-tab";
import { ComplianceTab } from "./tabs/compliance-tab";
import { TimelineTab } from "./tabs/timeline-tab";
import { StakeholdersTab } from "./tabs/stakeholders-tab";
import { CommunityTab } from "./tabs/community-tab";

const NSW_STATUS_STYLES: Record<string, React.CSSProperties> = {
  "Pre-lodgement":      { background: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  "Under Assessment":   { background: "rgba(200,164,78,0.12)", color: "#c8a44e" },
  "On Exhibition":      { background: "rgba(168,85,247,0.12)", color: "#a855f7" },
  "Approved":           { background: "rgba(34,197,94,0.12)",  color: "#22c55e" },
  "Refused":            { background: "rgba(239,68,68,0.12)",  color: "#ef4444" },
  "Under Construction": { background: "rgba(249,115,22,0.12)", color: "#f97316" },
  "Completed":          { background: "rgba(16,185,129,0.12)", color: "#10b981" },
};

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "documents", label: "Documents" },
  { id: "compliance", label: "Compliance" },
  { id: "timeline", label: "Timeline" },
  { id: "stakeholders", label: "Stakeholders" },
  { id: "community", label: "Community" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export type FullProject = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  phase: string;
  city: string;
  district: string | null;
  address: string | null;
  lga: string | null;
  projectType: string | null;
  applicantName: string | null;
  applicantEmail: string | null;
  lodgementDate: Date | null;
  dwellings: number | null;
  commercialGfa: number | null;
  buildingHeight: number | null;
  storeys: number | null;
  carParking: number | null;
  siteAreaHa: number | null;
  constructionCostM: number | null;
  greenSpaceHa: number | null;
  nswStatus: string | null;
  budget: number | null;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  members: {
    id: string;
    role: string;
    user: { id: string; name: string | null; email: string; role: string };
  }[];
  documents: {
    id: string;
    name: string;
    s3Key: string;
    fileType: string;
    fileSize: number | null;
    category: string | null;
    version: number;
    createdAt: Date;
    uploadedBy: { name: string | null };
  }[];
  complianceItems: {
    id: string;
    label: string;
    checked: boolean;
    notes: string | null;
    sortOrder: number;
  }[];
  milestones: {
    id: string;
    name: string;
    milestoneStatus: string;
    dueDate: Date | null;
    completedDate: Date | null;
    notes: string | null;
    sortOrder: number;
  }[];
  stakeholders: {
    id: string;
    name: string;
    role: string;
    email: string | null;
    phone: string | null;
    organisation: string | null;
  }[];
  submissions: {
    id: string;
    submitterName: string | null;
    dateReceived: Date;
    keyIssues: string | null;
    response: string | null;
    status: string;
    supporting: boolean;
  }[];
};

export function ProjectTabs({
  project: initialProject,
  canEdit,
}: {
  project: FullProject;
  canEdit: boolean;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [project, setProject] = useState(initialProject);

  function refreshProject(updates: Partial<FullProject>) {
    setProject((p) => ({ ...p, ...updates }));
  }

  const nswStyle = project.nswStatus
    ? (NSW_STATUS_STYLES[project.nswStatus] ?? { background: "var(--slate)", color: "var(--text-ghost)" })
    : { background: "var(--slate)", color: "var(--text-ghost)" };

  const daysElapsed = project.lodgementDate
    ? Math.floor((Date.now() - new Date(project.lodgementDate).getTime()) / 86_400_000)
    : null;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/projects" style={{ fontSize: 13, color: "var(--text-ghost)", display: "block", marginBottom: 4 }}>
            ← Projects
          </Link>
          <h1 style={{ fontFamily: "var(--font-syne, 'Open Sans', sans-serif)", fontWeight: 600, fontSize: 22, letterSpacing: 1, color: "var(--text-primary)" }}>{project.title}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {project.nswStatus && (
              <span style={{ ...nswStyle, fontSize: 11, padding: "2px 8px", borderRadius: 9999, fontWeight: 500 }}>
                {project.nswStatus}
              </span>
            )}
            {daysElapsed !== null && (
              <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{daysElapsed} days since lodgement</span>
            )}
            {project.lga && <span style={{ fontSize: 11, color: "var(--text-ghost)" }}>{project.lga}</span>}
          </div>
        </div>
        {canEdit && (
          <Link
            href={`/assistant?projectId=${project.id}`}
            style={{ background: "linear-gradient(135deg, var(--gold-dim), var(--gold))", color: "var(--void)", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600 }}
          >
            Ask AI
          </Link>
        )}
      </div>

      {/* Tab row */}
      <div className="mb-6" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-3 -mb-px transition-colors"
              style={{
                fontFamily: "var(--font-outfit, 'Open Sans', sans-serif)",
                fontWeight: activeTab === tab.id ? 500 : 400,
                fontSize: 13,
                color: activeTab === tab.id ? "var(--gold)" : "var(--text-ghost)",
                borderBottom: activeTab === tab.id ? "2px solid var(--gold)" : "2px solid transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <OverviewTab project={project} canEdit={canEdit} onUpdate={refreshProject} />
      )}
      {activeTab === "documents" && (
        <DocumentsTab project={project} canEdit={canEdit} onUpdate={refreshProject} />
      )}
      {activeTab === "compliance" && (
        <ComplianceTab project={project} canEdit={canEdit} onUpdate={refreshProject} />
      )}
      {activeTab === "timeline" && (
        <TimelineTab project={project} canEdit={canEdit} onUpdate={refreshProject} />
      )}
      {activeTab === "stakeholders" && (
        <StakeholdersTab project={project} canEdit={canEdit} onUpdate={refreshProject} />
      )}
      {activeTab === "community" && (
        <CommunityTab project={project} canEdit={canEdit} onUpdate={refreshProject} />
      )}
    </div>
  );
}
