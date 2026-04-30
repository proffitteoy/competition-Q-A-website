import { NextResponse } from "next/server";
import { z } from "zod";

import { submitApplicationService } from "@/server/services/application-service";

const submitSchema = z.object({
  competitionId: z.string().min(1),
  competitionTitle: z.string().min(1),
  applicantName: z.string().min(2),
  college: z.string().min(2),
  major: z.string().min(2),
  grade: z.string().min(1),
  mode: z.enum(["individual", "team"]),
});

export async function POST(request: Request) {
  try {
    const body = submitSchema.parse(await request.json());
    const application = await submitApplicationService(body);
    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "报名提交失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}

