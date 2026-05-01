import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/authorization";
import { listForReview } from "@/server/repositories/experience-post-repository";
import type { ExperiencePostStatus } from "@/server/repositories/experience-post-repository";

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser.id || !isAdminRole(sessionUser.role)) {
      return NextResponse.json({ message: "无权限。" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") as ExperiencePostStatus | null;
    const validStatuses: ExperiencePostStatus[] = [
      "draft",
      "pending_review",
      "published",
      "offline",
    ];
    const statusFilter =
      statusParam && validStatuses.includes(statusParam)
        ? statusParam
        : undefined;

    const posts = await listForReview(statusFilter);
    return NextResponse.json({ data: posts });
  } catch (error) {
    console.error("[admin/experience-posts:GET]", error);
    return NextResponse.json({ message: "获取文章列表失败。" }, { status: 500 });
  }
}
