import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/authorization";
import { isMissingRelationError } from "@/lib/db/errors";
import {
  reviewPost,
  adminOfflinePost,
} from "@/server/repositories/experience-post-repository";

const reviewSchema = z.object({
  action: z.enum(["approve", "reject", "offline"]),
  comment: z.string().max(500).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, ctx: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser.id || !isAdminRole(sessionUser.role)) {
      return NextResponse.json({ message: "无权限。" }, { status: 403 });
    }
    const { id } = await ctx.params;
    const body = reviewSchema.parse(await request.json());

    if (body.action === "offline") {
      await adminOfflinePost(id, sessionUser.id, body.comment);
    } else {
      await reviewPost(id, body.action, sessionUser.id, body.comment);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join("；");
      return NextResponse.json({ message }, { status: 400 });
    }
    if (isMissingRelationError(error)) {
      return NextResponse.json(
        { message: "经验文章功能尚未就绪，请联系管理员执行数据库迁移。" },
        { status: 503 },
      );
    }
    const message = error instanceof Error ? error.message : "审核失败。";
    console.error("[admin/experience-posts/[id]/review]", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
