import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/authorization";
import {
  getOneAdmin,
  updateHallOfFameEntry,
  deleteHallOfFameEntry,
} from "@/server/repositories/hall-of-fame-repository";

const updateSchema = z.object({
  tag: z.string().min(1).max(120).optional(),
  bio: z.string().max(2000).optional(),
  adminBio: z.string().max(2000).nullable().optional(),
  status: z.enum(["candidate", "active", "hidden"]).optional(),
  displayOrder: z.number().int().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, ctx: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser.id || !isAdminRole(sessionUser.role)) {
      return NextResponse.json({ message: "无权限。" }, { status: 403 });
    }
    const { id } = await ctx.params;
    const entry = await getOneAdmin(id);
    if (!entry) {
      return NextResponse.json({ message: "条目不存在。" }, { status: 404 });
    }
    return NextResponse.json({ data: entry });
  } catch (error) {
    console.error("[admin/hall-of-fame/[id]:GET]", error);
    return NextResponse.json({ message: "获取失败。" }, { status: 500 });
  }
}

export async function PUT(request: Request, ctx: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser.id || !isAdminRole(sessionUser.role)) {
      return NextResponse.json({ message: "无权限。" }, { status: 403 });
    }
    const { id } = await ctx.params;
    const body = updateSchema.parse(await request.json());
    const entry = await updateHallOfFameEntry(id, body);
    return NextResponse.json({ data: entry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join("；");
      return NextResponse.json({ message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "更新失败。";
    console.error("[admin/hall-of-fame/[id]:PUT]", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser.id || !isAdminRole(sessionUser.role)) {
      return NextResponse.json({ message: "无权限。" }, { status: 403 });
    }
    const { id } = await ctx.params;
    await deleteHallOfFameEntry(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/hall-of-fame/[id]:DELETE]", error);
    return NextResponse.json({ message: "删除失败。" }, { status: 500 });
  }
}
