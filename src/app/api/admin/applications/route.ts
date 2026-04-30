import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminRole } from "@/lib/auth/authorization";
import { getSessionUser } from "@/lib/auth/session";
import { listApplicationsWithFilters } from "@/server/repositories/application-repository";
import { bulkReviewApplicationsService } from "@/server/services/application-service";

const querySchema = z.object({
  keyword: z.string().optional(),
  status: z
    .enum(["draft", "submitted", "approved", "rejected", "withdrawn", "cancelled"])
    .optional(),
  competitionId: z.string().optional(),
});

const bulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "至少选择一条记录"),
  action: z.enum(["approve", "reject", "withdraw", "cancel"]),
  comment: z.string().min(1, "请填写批量处理备注"),
  competitionId: z.string().optional(),
});

export async function GET(request: Request) {
  const sessionUser = await getSessionUser();
  if (!isAdminRole(sessionUser.role)) {
    return NextResponse.json({ message: "无权访问" }, { status: 403 });
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    keyword: url.searchParams.get("keyword")?.trim() || undefined,
    status: url.searchParams.get("status")?.trim() || undefined,
    competitionId: url.searchParams.get("competitionId")?.trim() || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ message: "筛选参数不合法" }, { status: 400 });
  }

  const applications = await listApplicationsWithFilters(parsed.data);
  return NextResponse.json({ applications });
}

export async function POST(request: Request) {
  try {
    const body = bulkSchema.parse(await request.json());
    const sessionUser = await getSessionUser();
    if (!isAdminRole(sessionUser.role)) {
      return NextResponse.json({ message: "无权执行该操作" }, { status: 403 });
    }

    const result = await bulkReviewApplicationsService({
      ids: body.ids,
      competitionId: body.competitionId,
      action: body.action,
      comment: body.comment,
      operator: {
        userId: sessionUser.id,
        name: sessionUser.name,
        role: sessionUser.role,
        scopedCompetitionIds: sessionUser.scopedCompetitionIds,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "批量处理失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}
