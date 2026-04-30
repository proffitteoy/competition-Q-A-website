import { NextResponse } from "next/server";
import { z } from "zod";

import { isContentManagerRole } from "@/lib/auth/authorization";
import { getSessionUser } from "@/lib/auth/session";
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

  return NextResponse.json({
    notices,
    competitions: competitions.map((item) => ({
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
      content: body.content,
      status: body.status,
      operatorUserId: sessionUser.id,
    });

    return NextResponse.json({ notice }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create notice.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
