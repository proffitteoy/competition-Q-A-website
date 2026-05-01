"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { answerQuestionAction } from "@/actions/questions";

interface AnswerFormProps {
  questionId: string;
  competitionId: string;
  onSuccess?: () => void;
}

export function AnswerForm({
  questionId,
  competitionId,
  onSuccess,
}: AnswerFormProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await answerQuestionAction({
          questionId,
          competitionId,
          body: body.trim(),
        });
        setBody("");
        toast.success("回答已发布");
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "提交失败，请重试。");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="写下你的回答（支持 Markdown）…"
        rows={4}
        className="resize-none"
        required
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "提交中…" : "发布回答"}
      </Button>
    </form>
  );
}
