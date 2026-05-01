import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getQuestionSummaryByCompetition } from "@/server/repositories/question-repository";

interface QuestionSummaryCardProps {
  competitionId: string;
}

export async function QuestionSummaryCard({
  competitionId,
}: QuestionSummaryCardProps) {
  const questions = await getQuestionSummaryByCompetition(competitionId, 5);

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="size-5 text-primary" />
          问答讨论
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {questions.length === 0 ? (
          <p className="text-muted-foreground">暂无问答</p>
        ) : (
          <>
            {questions.map((q) => (
              <Link
                key={q.id}
                href={`/competitions/${competitionId}/questions/${q.id}`}
                className="block rounded-lg border border-dashed border-border/70 px-4 py-2.5 transition-colors hover:bg-muted/40"
              >
                <p className="truncate font-medium">{q.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {q.authorName} · {q.answerCount} 个回答
                </p>
              </Link>
            ))}
            <Link
              href={`/competitions/${competitionId}/questions`}
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              查看全部问答
              <ArrowRight className="size-3.5" />
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
