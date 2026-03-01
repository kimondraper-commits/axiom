import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runAllCalculators } from "@/lib/import/calculator-engine";
import { validateProjectRow } from "@/lib/import/validators";
import type { CalcSummary, ImportResult, RawRow, FieldMapping } from "@/lib/import/types";

const fieldMappingSchema = z.object({
  sourceColumn: z.string(),
  destinationField: z.string().nullable(),
  destinationGroup: z.string(),
  confidence: z.string(),
  samples: z.array(z.union([z.string(), z.number(), z.null()])),
});

const importRequestSchema = z.object({
  rows: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.null()]))),
  fieldMappings: z.array(fieldMappingSchema),
  fileName: z.string(),
  fileType: z.string(),
  mode: z.enum(["create", "upsert"]),
});

function buildProjectRow(raw: RawRow, mappings: FieldMapping[]): RawRow {
  const result: RawRow = {};
  for (const mapping of mappings) {
    if (mapping.destinationField && mapping.destinationGroup !== "Skip") {
      result[mapping.destinationField] = raw[mapping.sourceColumn] ?? null;
    }
  }
  return result;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PLANNER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = importRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { rows, fieldMappings, fileName, fileType, mode } = parsed.data;
  const typedMappings = fieldMappings as FieldMapping[];

  let projectsCreated = 0;
  let projectsUpdated = 0;
  const allErrors: { row: number; field: string; message: string }[] = [];
  const calcAccumulator = { population: 0, constructionFTEs: 0, ongoingJobs: 0, sustainabilityScore: 0 };
  let calcCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i] as RawRow;
    const projectRow = buildProjectRow(raw, typedMappings);
    const rowErrors = validateProjectRow(projectRow, i + 1);

    if (rowErrors.some((e) => e.field === "title")) {
      allErrors.push(...rowErrors);
      continue;
    }

    if (rowErrors.length > 0) {
      allErrors.push(...rowErrors);
    }

    // Only skip rows with fatal errors (missing title)
    const hasFatalError = rowErrors.some((e) => e.field === "title");
    if (hasFatalError) continue;

    const title = String(projectRow.title ?? "").trim();
    const city = String(projectRow.city ?? projectRow.lga ?? projectRow.address ?? "").trim();

    const lodgementDate =
      projectRow.lodgementDate
        ? (() => {
            try { return new Date(String(projectRow.lodgementDate)).toISOString(); }
            catch { return undefined; }
          })()
        : undefined;

    const projectData = {
      title,
      city: city || "Unknown",
      address: projectRow.address ? String(projectRow.address) : undefined,
      lga: projectRow.lga ? String(projectRow.lga) : undefined,
      projectType: projectRow.projectType ? String(projectRow.projectType) : undefined,
      nswStatus: projectRow.nswStatus ? String(projectRow.nswStatus) : undefined,
      applicantName: projectRow.applicantName ? String(projectRow.applicantName) : undefined,
      applicantEmail: projectRow.applicantEmail ? String(projectRow.applicantEmail) : undefined,
      lodgementDate: lodgementDate ? new Date(lodgementDate) : undefined,
      dwellings: projectRow.dwellings != null ? parseInt(String(projectRow.dwellings)) : undefined,
      commercialGfa: projectRow.commercialGfa != null ? parseFloat(String(projectRow.commercialGfa)) : undefined,
      buildingHeight: projectRow.buildingHeight != null ? parseFloat(String(projectRow.buildingHeight)) : undefined,
      storeys: projectRow.storeys != null ? parseInt(String(projectRow.storeys)) : undefined,
      carParking: projectRow.carParking != null ? parseInt(String(projectRow.carParking)) : undefined,
      siteAreaHa: projectRow.siteAreaHa != null ? parseFloat(String(projectRow.siteAreaHa)) : undefined,
      constructionCostM: projectRow.constructionCostM != null ? parseFloat(String(projectRow.constructionCostM)) : undefined,
      greenSpaceHa: projectRow.greenSpaceHa != null ? parseFloat(String(projectRow.greenSpaceHa)) : undefined,
    };

    // Strip undefined and NaN values
    const cleanData = Object.fromEntries(
      Object.entries(projectData).filter(([, v]) => {
        if (v === undefined) return false;
        if (typeof v === "number" && isNaN(v)) return false;
        return true;
      })
    );

    try {
      if (mode === "upsert") {
        const existing = await db.project.findFirst({
          where: { title: { equals: title, mode: "insensitive" } },
        });
        if (existing) {
          await db.project.update({ where: { id: existing.id }, data: cleanData });
          projectsUpdated++;
        } else {
          await db.project.create({
            data: {
              ...cleanData,
              title,
              city: (cleanData.city as string) || "Unknown",
              members: { create: { userId: session.user.id, role: "PLANNER" } },
            },
          });
          projectsCreated++;
        }
      } else {
        await db.project.create({
          data: {
            ...cleanData,
            title,
            city: (cleanData.city as string) || "Unknown",
            members: { create: { userId: session.user.id, role: "PLANNER" } },
          },
        });
        projectsCreated++;
      }

      // Accumulate calc summary
      const calc = runAllCalculators({
        dwellings: projectData.dwellings,
        siteAreaHa: projectData.siteAreaHa,
        constructionCostM: projectData.constructionCostM,
        commercialGfa: projectData.commercialGfa,
        greenSpaceHa: projectData.greenSpaceHa,
      });
      calcAccumulator.population += calc.population;
      calcAccumulator.constructionFTEs += calc.constructionFTEs;
      calcAccumulator.ongoingJobs += calc.ongoingJobs;
      calcAccumulator.sustainabilityScore += calc.sustainabilityScore;
      calcCount++;
    } catch (err) {
      allErrors.push({
        row: i + 1,
        field: "general",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  const calcSummary: CalcSummary | null =
    calcCount > 0
      ? {
          population: calcAccumulator.population,
          constructionFTEs: calcAccumulator.constructionFTEs,
          ongoingJobs: calcAccumulator.ongoingJobs,
          sustainabilityScore: Math.round(calcAccumulator.sustainabilityScore / calcCount),
        }
      : null;

  const dataImport = await db.dataImport.create({
    data: {
      filename: fileName,
      fileType,
      rowCount: rows.length,
      mappedFields: typedMappings as object[],
      status: allErrors.length > 0 && projectsCreated + projectsUpdated === 0 ? "FAILED" : "COMPLETED",
      importedById: session.user.id,
      projectsCreated,
      projectsUpdated,
      errorCount: allErrors.length,
      errorLog: allErrors.length > 0 ? (allErrors as object[]) : undefined,
      calcSummary: calcSummary ? (calcSummary as object) : undefined,
    },
  });

  const result: ImportResult = {
    importId: dataImport.id,
    projectsCreated,
    projectsUpdated,
    errorCount: allErrors.length,
    errors: allErrors,
    calcSummary,
  };

  return NextResponse.json({ data: result }, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const imports = await db.dataImport.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      importedBy: {
        select: { name: true, email: true },
      },
    },
  });

  return NextResponse.json({ data: imports });
}
