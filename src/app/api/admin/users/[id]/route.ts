import { NextResponse } from "next/server";
import { z } from "zod";

import { isSuperAdminRole } from "@/lib/auth/authorization";
import { getSessionUser } from "@/lib/auth/session";
import {
  getAdminUserById,
  setUserPrimaryRole,
  updateUserStatus,
} from "@/server/repositories/user-repository";

const updateUserSchema = z
  .object({
    status: z.enum(["active", "pending_verification", "disabled"]).optional(),
    role: z
      .enum([
        "super_admin",
        "competition_admin",
        "content_editor",
        "student_user",
      ])
      .optional(),
    competitionId: z.string().trim().min(1).nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.status && !value.role) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "至少提供一项更新字段",
      });
    }

    if (!value.role && value.competitionId !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "未指定 role 时不能单独提交 competitionId",
      });
    }

    if (
      (value.role === "competition_admin" || value.role === "content_editor") &&
      !value.competitionId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "competition_admin/content_editor 必须指定比赛作用域",
      });
    }
  });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionUser = await getSessionUser();
    if (!isSuperAdminRole(sessionUser.role)) {
      return NextResponse.json({ message: "无权执行该操作" }, { status: 403 });
    }

    const { id } = await params;
    const body = updateUserSchema.parse(await request.json());

    const existing = await getAdminUserById(id);
    if (!existing) {
      return NextResponse.json({ message: "用户不存在" }, { status: 404 });
    }

    let updated = existing;
    if (body.status) {
      updated = (await updateUserStatus(id, body.status)) ?? updated;
    }

    if (body.role) {
      updated =
        (await setUserPrimaryRole({
          userId: id,
          role: body.role,
          competitionId: body.competitionId ?? undefined,
          grantedBy: sessionUser.id,
        })) ?? updated;
    }

    return NextResponse.json({ user: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新用户失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}
