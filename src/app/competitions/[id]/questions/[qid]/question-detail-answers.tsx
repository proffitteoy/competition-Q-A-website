"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { AnswerCard } from "@/components/questions/answer-card";
import { CommentTree } from "@/components/questions/comment-tree";
import { acceptAnswerAction } from "@/actions/questions";

interface Answer {
  id: string;
  authorName: string;
  body: string;
  isAccepted: boolean;
  createdAt: string;
}

interface Comment {
  id: string;
  questionId: string;
  answerId: string | null;
  parentId: string | null;
  depth: number;
  authorName: string;
  body: string;
  createdAt: string;
}

interface QuestionDetailAnswersProps {
  answers: Answer[];
  comments: Comment[];
  questionId: string;
  competitionId: string;
  canAccept: boolean;
  isLoggedIn: boolean;
}

export function QuestionDetailAnswers({
  answers,
  comments,
  questionId,
  competitionId,
  canAccept,
  isLoggedIn,
}: QuestionDetailAnswersProps) {
  const [isPending, startTransition] = useTransition();

  function handleAccept(answerId: string) {
    startTransition(async () => {
      try {
        await acceptAnswerAction({
          answerId,
          questionId,
          competitionId,
        });
        toast.success("已采纳该回答");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "操作失败，请重试。");
      }
    });
  }

  if (answers.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        暂无回答
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {answers.map((answer) => {
        const answerComments = comments.filter(
          (c) => c.answerId === answer.id,
        );
        return (
          <div key={answer.id} className="space-y-2">
            <AnswerCard
              {...answer}
              canAccept={canAccept}
              onAccept={handleAccept}
            />
            {(answerComments.length > 0 || isLoggedIn) && (
              <div className="ml-4">
                <CommentTree
                  comments={answerComments}
                  questionId={questionId}
                  competitionId={competitionId}
                  answerId={answer.id}
                  isLoggedIn={isLoggedIn}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
