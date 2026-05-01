import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminRole } from "@/lib/auth/authorization";
import { getSessionUser } from "@/lib/auth/session";
import { assertCanManageCompetitions } from "@/server/permissions/competition-permissions";
import {
  createCompetition,
  listCompetitions,
} from "@/server/repositories/competition-repository";

const faqSchema = z.object({
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
});

const timelineSchema = z.object({
  label: z.string().trim().min(1),
  date: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

const createSchema = z.object({
  slug: z.string().trim().min(1).optional(),
  title: z.string().trim().min(2),
  category: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  department: z.string().trim().min(1),
  registrationMode: z.enum(["individual", "team"]),
  status: z
    .enum(["draft", "upcoming", "registration_open", "in_progress", "finished", "archived"])
    .optional(),
  registrationStartAt: z.string().optional(),
  registrationEndAt: z.string().optional(),
  eventStartAt: z.string().optional(),
  eventEndAt: z.string().optional(),
  location: z.string().trim().optional(),
  coverLabel: z.string().trim().optional(),
  description: z.string().trim().optional(),
  highlights: z.array(z.string()).optional(),
  timeline: z.array(timelineSchema).optional(),
  relatedQuestions: z.array(z.string()).optional(),
  faqs: z.array(faqSchema).optional(),
  attachments: z.array(z.string()).optional(),
});

function toDate(value?: string) {
  if (!value || value.trim().length === 0) return null;
  const next = new Date(value);
  if (Number.isNaN(next.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return next;
}

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!isAdminRole(sessionUser.role)) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const competitions = await listCompetitions();
  const visible =
    sessionUser.role === "super_admin"
      ? competitions
      : competitions.filter((item) => sessionUser.scopedCompetitionIds.includes(item.id));

  return NextResponse.json({ competitions: visible });
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!isAdminRole(sessionUser.role)) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    assertCanManageCompetitions({
      role: sessionUser.role,
      scopedCompetitionIds: sessionUser.scopedCompetitionIds,
    });

    const body = createSchema.parse(await request.json());
    const competition = await createCompetition({
      slug: body.slug,
      title: body.title,
      category: body.category,
      summary: body.summary,
      department: body.department,
      registrationMode: body.registrationMode,
      status: body.status,
      registrationStartAt: toDate(body.registrationStartAt),
      registrationEndAt: toDate(body.registrationEndAt),
      eventStartAt: toDate(body.eventStartAt),
      eventEndAt: toDate(body.eventEndAt),
      location: body.location ?? null,
      coverLabel: body.coverLabel ?? null,
      description: body.description ?? null,
      highlights: body.highlights ?? [],
      timeline: body.timeline ?? [],
      relatedQuestions: body.relatedQuestions ?? [],
      faqs: body.faqs ?? [],
      attachments: body.attachments ?? [],
      createdBy: sessionUser.id,
    });

    return NextResponse.json({ competition }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create competition.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
