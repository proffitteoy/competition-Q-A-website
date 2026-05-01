import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/authorization";
import { isMissingRelationError } from "@/lib/db/errors";
import {
  listAllAdmin,
  createHallOfFameEntry,
} from "@/server/repositories/hall-of-fame-repository";

const createSchema = z.object({
  userId: z.string().uuid(),
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
    const entry = await createHallOfFameEntry(body, sessionUser.id);
    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join("；");
      return NextResponse.json({ message }, { status: 400 });
    }
    console.error("[admin/hall-of-fame:POST]", error);
    return NextResponse.json({ message: "创建失败。" }, { status: 500 });
  }
}
