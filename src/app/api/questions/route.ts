import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth/auth";
import { askQuestionService } from "@/server/services/question-service";

const askQuestionSchema = z.object({
  competitionId: z.string().min(1),
  title: z.string().min(4, "标题至少 4 个字符").max(255),
  body: z.string().min(10, "正文至少 10 个字符"),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "请先登录后再提问。" },
        { status: 401 },
      );
    }

    const body = askQuestionSchema.parse(await request.json());
    const question = await askQuestionService({
      ...body,
      actor: {
        userId: session.user.id,
        role: session.user.role,
        scopedCompetitionIds: session.user.scopedCompetitionIds ?? [],
      },
    });

    revalidatePath(`/competitions/${body.competitionId}/questions`);
    revalidatePath(`/competitions/${body.competitionId}`);

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "发布问题失败。";
    return NextResponse.json({ message }, { status: 400 });
  }
}
