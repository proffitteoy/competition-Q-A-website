import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth/session";
import { submitApplicationService } from "@/server/services/application-service";

const uploadedFileSchema = z.object({
  originalName: z.string(),
  storedName: z.string(),
  storageKey: z.string(),
  publicUrl: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  mimeType: z.string(),
});

const submitSchema = z.object({
  competitionId: z.string().min(1),
  competitionTitle: z.string().min(1),
  applicantName: z.string().min(2),
  studentId: z.string().min(6),
  college: z.string().min(2),
  major: z.string().min(2),
  grade: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email(),
  statement: z.string().min(12),
  teamName: z.string().optional(),
  attachments: z.array(uploadedFileSchema).optional(),
  mode: z.enum(["individual", "team"]),
});

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser.id) {
      return NextResponse.json(
        { message: "请先登录后再提交报名。" },
        { status: 401 },
      );
    }

    const body = submitSchema.parse(await request.json());
    const application = await submitApplicationService({
      ...body,
      applicantUserId: sessionUser.id,
    });
    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "报名提交失败。";
    return NextResponse.json({ message }, { status: 400 });
  }
}
