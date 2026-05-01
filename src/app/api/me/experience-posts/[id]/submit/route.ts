import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { isMissingRelationError } from "@/lib/db/errors";
import { submitExperiencePost } from "@/server/repositories/experience-post-repository";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, ctx: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser.id) {
      return NextResponse.json({ message: "请先登录。" }, { status: 401 });
    }
    const { id } = await ctx.params;
    await submitExperiencePost(sessionUser.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (isMissingRelationError(error)) {
      return NextResponse.json(
        { message: "经验文章功能尚未就绪，请联系管理员执行数据库迁移。" },
        { status: 503 },
      );
    }
    const message = error instanceof Error ? error.message : "提交失败。";
    const status = message.includes("不存在") ? 404 : message.includes("草稿") ? 400 : 500;
    console.error("[me/experience-posts/[id]/submit]", error);
    return NextResponse.json({ message }, { status });
  }
}
