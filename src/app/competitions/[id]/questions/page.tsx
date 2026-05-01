import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { PortalNavbar } from "@/components/marketing/portal-navbar";
import { PortalFooter } from "@/components/marketing/portal-footer";
import { Section } from "@/components/marketing/section";
import { Button } from "@/components/ui/button";
import { QuestionList } from "@/components/questions/question-list";
import { AskQuestionForm } from "@/components/questions/ask-question-form";
import { getCompetitionById } from "@/server/repositories/competition-repository";
import { listQuestionsByCompetition } from "@/server/repositories/question-repository";

export default async function QuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [competition, session] = await Promise.all([
    getCompetitionById(id),
    auth(),
  ]);

  if (!competition) {
    notFound();
  }

  const isLoggedIn = !!session?.user;
  const questions = await listQuestionsByCompetition(id);

  return (
    <div className="min-h-screen bg-background">
      <PortalNavbar />
      <Section className="pb-10">
        <div className="mx-auto max-w-3xl space-y-6">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/competitions" className="hover:text-foreground">
              比赛列表
            </Link>
            <ChevronRight className="size-3.5" />
            <Link
              href={`/competitions/${id}`}
              className="hover:text-foreground"
            >
              {competition.title}
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">问答讨论</span>
          </nav>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">问答讨论</h1>
          </div>

          <QuestionList questions={questions} />

          {isLoggedIn && (
            <div className="rounded-xl border border-border/70 p-5">
              <h2 className="mb-4 font-medium">我要提问</h2>
              <AskQuestionForm competitionId={id} />
            </div>
          )}
        </div>
      </Section>
      <PortalFooter />
    </div>
  );
}
