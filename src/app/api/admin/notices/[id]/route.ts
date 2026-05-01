import { NextResponse } from "next/server";
import { z } from "zod";

import { isContentManagerRole } from "@/lib/auth/authorization";
import { getSessionUser } from "@/lib/auth/session";
import {
  extractPlainTextFromHtml,
  sanitizeRichTextHtml,
} from "@/lib/security/html-sanitize";
import { assertCanEditCompetitionContent } from "@/server/permissions/competition-permissions";
import {
  deleteNotice,
  getNoticeById,
  updateNotice,
} from "@/server/repositories/notice-repository";

const updateNoticeSchema = z.object({
  competitionId: z.string().trim().min(1).optional(),
  title: z.string().trim().min(2).max(255).optional(),
  content: z.string().trim().min(1).optional(),
  status: z.enum(["draft", "published", "withdrawn"]).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionUser = await getSessionUser();
    if (!isContentManagerRole(sessionUser.role)) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const { id } = await params;
    const current = await getNoticeById(id);
    if (!current) {
      return NextResponse.json({ message: "Notice not found." }, { status: 404 });
    }

    const body = updateNoticeSchema.parse(await request.json());
    const sanitizedContent =
      body.content === undefined ? undefined : sanitizeRichTextHtml(body.content);
    if (
      sanitizedContent !== undefined &&
      extractPlainTextFromHtml(sanitizedContent).length === 0
    ) {
      return NextResponse.json({ message: "通知内容不能为空" }, { status: 400 });
    }
    const nextCompetitionId = body.competitionId ?? current.competitionId;
    assertCanEditCompetitionContent(
      {
        role: sessionUser.role,
        scopedCompetitionIds: sessionUser.scopedCompetitionIds,
      },
      nextCompetitionId,
    );

    const notice = await updateNotice(id, {
      competitionId: body.competitionId,
      title: body.title,
      content: sanitizedContent,
      status: body.status,
      operatorUserId: sessionUser.id,
    });

    return NextResponse.json({ notice });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update notice.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionUser = await getSessionUser();
    if (!isContentManagerRole(sessionUser.role)) {
      return NextResponse.json({ message: "Forbidden." }, { status: 403 });
    }

    const { id } = await params;
    const current = await getNoticeById(id);
    if (!current) {
      return NextResponse.json({ message: "Notice not found." }, { status: 404 });
    }

    assertCanEditCompetitionContent(
      {
        role: sessionUser.role,
        scopedCompetitionIds: sessionUser.scopedCompetitionIds,
      },
      current.competitionId,
    );

    const deleted = await deleteNotice(id);
    if (!deleted) {
      return NextResponse.json({ message: "Notice not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete notice.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
