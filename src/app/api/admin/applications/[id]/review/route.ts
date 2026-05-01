import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminRole } from "@/lib/auth/authorization";
import { getSessionUser } from "@/lib/auth/session";
import { getApplicationById } from "@/server/repositories/application-repository";
import { reviewApplicationService } from "@/server/services/application-service";

const reviewSchema = z.object({
  action: z.enum(["approve", "reject", "withdraw", "cancel"]),
  comment: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = reviewSchema.parse(await request.json());
    const application = await getApplicationById(id);
    if (!application) {
      return NextResponse.json({ message: "报名记录不存在" }, { status: 404 });
    }

    const sessionUser = await getSessionUser();
    if (!isAdminRole(sessionUser.role)) {
      return NextResponse.json({ message: "无权执行该操作" }, { status: 403 });
    }

    if (
      sessionUser.role !== "super_admin" &&
      !sessionUser.scopedCompetitionIds.includes(application.competitionId)
    ) {
      return NextResponse.json({ message: "无权审核该比赛报名" }, { status: 403 });
    }

    const nextApplication = await reviewApplicationService({
      id,
      competitionId: application.competitionId,
      action: body.action,
      operator: {
        userId: sessionUser.id,
        name: sessionUser.name,
        role: sessionUser.role,
        scopedCompetitionIds: sessionUser.scopedCompetitionIds,
      },
      comment: body.comment,
      currentStatus: application.status,
    });

    return NextResponse.json({ application: nextApplication });
  } catch (error) {
    const message = error instanceof Error ? error.message : "审核失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}
