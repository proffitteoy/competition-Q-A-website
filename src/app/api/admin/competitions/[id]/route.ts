import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminRole } from "@/lib/auth/authorization";
import { getSessionUser } from "@/lib/auth/session";
import { assertCanManageCompetitions } from "@/server/permissions/competition-permissions";
import {
  deleteCompetition,
  getCompetitionById,
  updateCompetition,
} from "@/server/repositories/competition-repository";
import { changeCompetitionStatusService } from "@/server/services/competition-status-service";

const faqSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
});

const timelineSchema = z.object({
  label: z.string().trim().min(1),
  date: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

const updateSchema = z.object({
  slug: z.string().trim().min(1).optional(),
  title: z.string().trim().min(2).optional(),
  category: z.string().trim().min(1).optional(),
  summary: z.string().trim().min(1).optional(),
  department: z.string().trim().min(1).optional(),
  registrationMode: z.enum(["individual", "team"]).optional(),
  status: z
    .enum(["draft", "upcoming", "registration_open", "in_progress", "finished", "archived"])
    .optional(),
  statusReason: z.string().trim().min(1).optional(),
  registrationStartAt: z.string().optional(),
  registrationEndAt: z.string().optional(),
  eventStartAt: z.string().optional(),
  eventEndAt: z.string().optional(),
  location: z.string().optional(),
  coverLabel: z.string().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  timeline: z.array(timelineSchema).optional(),
  relatedQuestions: z.array(z.string()).optional(),
  faqs: z.array(faqSchema).optional(),
  attachments: z.array(z.string()).optional(),
});

function toDateOrUndefined(value: string | undefined) {
  if (value === undefined) return undefined;
  if (value.trim().length === 0) return null;
  const next = new Date(value);
  if (Number.isNaN(next.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return next;
}

function normalizeOptionalText(value: string | undefined) {
  if (value === undefined) return undefined;
  const next = value.trim();
  return next.length === 0 ? null : next;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const sessionUser = await getSessionUser();
  if (!isAdminRole(sessionUser.role)) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const competition = await getCompetitionById(id);
  if (!competition) {
    return NextResponse.json({ message: "Competition not found." }, { status: 404 });
  }

  assertCanManageCompetitions(
    {
      role: sessionUser.role,
      scopedCompetitionIds: sessionUser.scopedCompetitionIds,
    },
    id,
  );

  return NextResponse.json({ competition });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionUser = await getSessionUser();
    if (!isAdminRole(sessionUser.role)) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const { id } = await params;
    const current = await getCompetitionById(id);
    if (!current) {
      return NextResponse.json({ message: "Competition not found." }, { status: 404 });
    }

    assertCanManageCompetitions(
      {
        role: sessionUser.role,
        scopedCompetitionIds: sessionUser.scopedCompetitionIds,
      },
      id,
    );

    const body = updateSchema.parse(await request.json());

    const updatePayload = {
      slug: body.slug,
      title: body.title,
      category: body.category,
      summary: body.summary,
      department: body.department,
      registrationMode: body.registrationMode,
      registrationStartAt: toDateOrUndefined(body.registrationStartAt),
      registrationEndAt: toDateOrUndefined(body.registrationEndAt),
      eventStartAt: toDateOrUndefined(body.eventStartAt),
      eventEndAt: toDateOrUndefined(body.eventEndAt),
      location: normalizeOptionalText(body.location),
      coverLabel: normalizeOptionalText(body.coverLabel),
      description: normalizeOptionalText(body.description),
      highlights: body.highlights,
      timeline: body.timeline,
      relatedQuestions: body.relatedQuestions,
      faqs: body.faqs,
      attachments: body.attachments,
    };

    const hasUpdateFields = Object.values(updatePayload).some(
      (value) => value !== undefined,
    );

    if (hasUpdateFields) {
      await updateCompetition(id, updatePayload);
    }

    if (body.status && body.status !== current.status) {
      await changeCompetitionStatusService({
        competitionId: id,
        toStatus: body.status,
        reason: body.statusReason ?? "Status updated by admin.",
        operator: {
          userId: sessionUser.id,
          role: sessionUser.role,
          scopedCompetitionIds: sessionUser.scopedCompetitionIds,
        },
      });
    }

    const refreshed = await getCompetitionById(id);
    return NextResponse.json({ competition: refreshed });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update competition.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionUser = await getSessionUser();
    if (!isAdminRole(sessionUser.role)) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const { id } = await params;
    assertCanManageCompetitions(
      {
        role: sessionUser.role,
        scopedCompetitionIds: sessionUser.scopedCompetitionIds,
      },
      id,
    );

    const deleted = await deleteCompetition(id);
    if (!deleted) {
      return NextResponse.json({ message: "Competition not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete competition.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
