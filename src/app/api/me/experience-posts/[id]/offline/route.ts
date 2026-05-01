import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { offlineExperiencePost } from "@/server/repositories/experience-post-repository";

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
    await offlineExperiencePost(sessionUser.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "下线失败。";
    const status = message.includes("不存在") ? 404 : message.includes("已发布") ? 400 : 500;
    console.error("[me/experience-posts/[id]/offline]", error);
    return NextResponse.json({ message }, { status });
  }
}
