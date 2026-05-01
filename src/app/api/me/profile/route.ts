import { NextResponse } from "next/server";
import { z } from "zod";

import { getMissingRelationSetupMessage } from "@/lib/db/errors";
import { getSessionUser } from "@/lib/auth/session";
import {
  getMeProfile,
  updateMeProfile,
} from "@/server/repositories/me-profile-repository";
import { resolveUserTitles } from "@/server/services/user-title-service";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser.id) {
    return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  }

  const data = await getMeProfile(sessionUser.id);
  const titles = await resolveUserTitles(sessionUser.id);

  return NextResponse.json({ data, titles });
}

const updateSchema = z.object({
  name: z.string().min(1, "姓名不能为空").max(100).optional(),
  studentNo: z.string().max(64).optional(),
  college: z.string().max(120).optional(),
  major: z.string().max(120).optional(),
  grade: z.string().max(64).optional(),
  phone: z.string().max(64).optional(),
  nickname: z.string().max(100).nullable().optional(),
  gender: z.enum(["male", "female", "other"]).nullable().optional(),
  birthday: z.string().nullable().optional(),
  schoolName: z.string().max(200).nullable().optional(),
  department: z.string().max(120).nullable().optional(),
  enrollmentYear: z
    .number()
    .int()
    .min(1990)
    .max(2100)
    .nullable()
    .optional(),
  educationLevel: z.string().max(64).nullable().optional(),
  inSchoolStatus: z
    .enum(["yes", "no", "graduated"])
    .nullable()
    .optional(),
  publicBio: z.string().max(500).nullable().optional(),
  skillTags: z.array(z.string().max(30)).max(10).optional(),
  publicShowAvatar: z.boolean().optional(),
  publicShowCollegeMajor: z.boolean().optional(),
  publicShowTitles: z.boolean().optional(),
});

export async function PUT(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser.id) {
      return NextResponse.json({ message: "请先登录。" }, { status: 401 });
    }

    const body = updateSchema.parse(await request.json());
    await updateMeProfile(sessionUser.id, body);

    const data = await getMeProfile(sessionUser.id);
    const titles = await resolveUserTitles(sessionUser.id);

    return NextResponse.json({ data, titles });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join("；");
      return NextResponse.json({ message }, { status: 400 });
    }
    console.error("[me/profile] update failed:", error);

    const setupMessage = getMissingRelationSetupMessage(
      error,
      "user_profile",
      "个人资料",
    );
    if (setupMessage) {
      return NextResponse.json({ message: setupMessage }, { status: 503 });
    }

    return NextResponse.json(
      { message: "更新个人资料失败，请稍后重试。" },
      { status: 500 },
    );
  }
}
