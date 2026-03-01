import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await db.project.findUnique({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      documents: { orderBy: { createdAt: "desc" }, include: { uploadedBy: { select: { name: true } } } },
      complianceItems: { orderBy: { sortOrder: "asc" } },
      milestones: { orderBy: { sortOrder: "asc" } },
      stakeholders: { orderBy: { createdAt: "asc" } },
      submissions: { orderBy: { dateReceived: "desc" } },
    },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: project });
}

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]).optional(),
  nswStatus: z.string().optional(),
  lga: z.string().optional(),
  projectType: z.string().optional(),
  applicantName: z.string().optional(),
  applicantEmail: z.string().email().optional().or(z.literal("")),
  lodgementDate: z.string().datetime().optional().nullable(),
  dwellings: z.number().int().nonnegative().optional().nullable(),
  commercialGfa: z.number().nonnegative().optional().nullable(),
  buildingHeight: z.number().nonnegative().optional().nullable(),
  storeys: z.number().int().nonnegative().optional().nullable(),
  carParking: z.number().int().nonnegative().optional().nullable(),
  siteAreaHa: z.number().nonnegative().optional().nullable(),
  constructionCostM: z.number().nonnegative().optional().nullable(),
  greenSpaceHa: z.number().nonnegative().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PLANNER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const project = await db.project.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ data: project });
}
