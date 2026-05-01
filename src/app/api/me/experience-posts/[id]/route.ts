import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth/session";
import {
  getMyExperiencePost,
  updateExperiencePost,
  deleteExperiencePost,
} from "@/server/repositories/experience-post-repository";

const updateSchema = z.object({
  competitionId: z.string().max(64).nullable().optional(),
  competitionTitle: z.string().max(300).nullable().optional(),
  title: z.string().min(1).max(300).optional(),
  content: z.string().optional(),
  awardLevel: z.string().max(120).nullable().optional(),
  coverImage: z.string().nullable().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, ctx: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser.id) {
      return NextResponse.json({ message: "请先登录。" }, { status: 401 });
    }
    const { id } = await ctx.params;
    const post = await getMyExperiencePost(sessionUser.id, id);
    if (!post) {
      return NextResponse.json({ message: "文章不存在。" }, { status: 404 });
    }
    return NextResponse.json({ data: post });
  } catch (error) {
    console.error("[me/experience-posts/[id]:GET]", error);
    return NextResponse.json({ message: "获取文章失败。" }, { status: 500 });
  }
}

export async function PUT(request: Request, ctx: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser.id) {
      return NextResponse.json({ message: "请先登录。" }, { status: 401 });
    }
    const { id } = await ctx.params;
    const body = updateSchema.parse(await request.json());
    const post = await updateExperiencePost(sessionUser.id, id, body);
    return NextResponse.json({ data: post });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join("；");
      return NextResponse.json({ message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "更新失败。";
    const status = message.includes("不存在") ? 404 : message.includes("可编辑") ? 400 : 500;
    console.error("[me/experience-posts/[id]:PUT]", error);
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(_request: Request, ctx: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser.id) {
      return NextResponse.json({ message: "请先登录。" }, { status: 401 });
    }
    const { id } = await ctx.params;
    await deleteExperiencePost(sessionUser.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "删除失败。";
    const status = message.includes("不存在") ? 404 : message.includes("下线") ? 400 : 500;
    console.error("[me/experience-posts/[id]:DELETE]", error);
    return NextResponse.json({ message }, { status });
  }
}
