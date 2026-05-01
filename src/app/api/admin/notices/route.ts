import { NextResponse } from "next/server";
import { z } from "zod";

import { isContentManagerRole } from "@/lib/auth/authorization";
import { getSessionUser } from "@/lib/auth/session";
import {
  extractPlainTextFromHtml,
  sanitizeRichTextHtml,
} from "@/lib/security/html-sanitize";
import { assertCanEditCompetitionContent } from "@/server/permissions/competition-permissions";
import { listCompetitions } from "@/server/repositories/competition-repository";
import { createNotice, listNotices } from "@/server/repositories/notice-repository";

const createNoticeSchema = z.object({
  competitionId: z.string().trim().min(1),
  title: z.string().trim().min(2).max(255),
  content: z.string().trim().min(1),
  status: z.enum(["draft", "published", "withdrawn"]),
});

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!isContentManagerRole(sessionUser.role)) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const [notices, competitions] = await Promise.all([
    listNotices(),
    listCompetitions(),
  ]);
  const scopedCompetitionIds =
    sessionUser.role === "super_admin"
      ? null
      : new Set(sessionUser.scopedCompetitionIds);
  const visibleNotices =
    scopedCompetitionIds === null
      ? notices
      : notices.filter((item) => scopedCompetitionIds.has(item.competitionId));
  const visibleCompetitions =
    scopedCompetitionIds === null
      ? competitions
      : competitions.filter((item) => scopedCompetitionIds.has(item.id));

  return NextResponse.json({
    notices: visibleNotices,
    competitions: visibleCompetitions.map((item) => ({
      id: item.id,
      title: item.title,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!isContentManagerRole(sessionUser.role)) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const body = createNoticeSchema.parse(await request.json());
    const sanitizedContent = sanitizeRichTextHtml(body.content);
    if (extractPlainTextFromHtml(sanitizedContent).length === 0) {
      return NextResponse.json({ message: "通知内容不能为空" }, { status: 400 });
    }
    assertCanEditCompetitionContent(
      {
        role: sessionUser.role,
        scopedCompetitionIds: sessionUser.scopedCompetitionIds,
      },
      body.competitionId,
    );

    const notice = await createNotice({
      competitionId: body.competitionId,
      title: body.title,
      content: sanitizedContent,
      status: body.status,
      operatorUserId: sessionUser.id,
    });

    return NextResponse.json({ notice }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create notice.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
