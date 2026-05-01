import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { getSessionUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/authorization";
import { isMissingRelationError } from "@/lib/db/errors";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import {
  listAllAdmin,
  createHallOfFameEntry,
} from "@/server/repositories/hall-of-fame-repository";

const createSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  tag: z.string().min(1).max(120),
  bio: z.string().max(2000).optional(),
  adminBio: z.string().max(2000).nullable().optional(),
  status: z.enum(["candidate", "active", "hidden"]).optional(),
  displayOrder: z.number().int().optional(),
});

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser.id || !isAdminRole(sessionUser.role)) {
      return NextResponse.json({ message: "无权限。" }, { status: 403 });
    }
    const entries = await listAllAdmin();
    return NextResponse.json({ data: entries });
  } catch (error) {
    if (isMissingRelationError(error)) {
      return NextResponse.json({ data: [] });
    }
    console.error("[admin/hall-of-fame:GET]", error);
    return NextResponse.json({ message: "获取名人堂列表失败。" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser.id || !isAdminRole(sessionUser.role)) {
      return NextResponse.json({ message: "无权限。" }, { status: 403 });
    }
    const body = createSchema.parse(await request.json());

    const db = getDb();
    const userRow = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });
    if (!userRow) {
      return NextResponse.json(
        { message: `未找到邮箱为 ${body.email} 的用户。` },
        { status: 404 },
      );
    }

    const { email: _, ...rest } = body;
    const entry = await createHallOfFameEntry(
      { ...rest, userId: userRow.id },
      sessionUser.id,
    );
    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join("；");
      return NextResponse.json({ message }, { status: 400 });
    }
    if (isMissingRelationError(error)) {
      return NextResponse.json(
        { message: "名人堂功能尚未就绪，请联系管理员执行数据库迁移。" },
        { status: 503 },
      );
    }
    console.error("[admin/hall-of-fame:POST]", error);
    return NextResponse.json({ message: "创建失败。" }, { status: 500 });
  }
}
