import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth/session";
import {
  listMyExperiencePosts,
  createExperiencePost,
} from "@/server/repositories/experience-post-repository";

const createSchema = z.object({
  competitionId: z.string().max(64).nullable().optional(),
  competitionTitle: z.string().max(300).nullable().optional(),
  title: z.string().min(1, "标题不能为空").max(300),
  content: z.string().optional(),
  awardLevel: z.string().max(120).nullable().optional(),
  coverImage: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser.id) {
      return NextResponse.json({ message: "请先登录。" }, { status: 401 });
    }
    const posts = await listMyExperiencePosts(sessionUser.id);
    return NextResponse.json({ data: posts });
  } catch (error) {
    console.error("[me/experience-posts:GET]", error);
    return NextResponse.json({ message: "获取文章列表失败。" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser.id) {
      return NextResponse.json({ message: "请先登录。" }, { status: 401 });
    }
    const body = createSchema.parse(await request.json());
    const post = await createExperiencePost(sessionUser.id, body);
    return NextResponse.json({ data: post }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join("；");
      return NextResponse.json({ message }, { status: 400 });
    }
    console.error("[me/experience-posts:POST]", error);
    return NextResponse.json({ message: "创建文章失败。" }, { status: 500 });
  }
}
