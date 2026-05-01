"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addCommentAction } from "@/actions/questions";

interface CommentFormProps {
  questionId: string;
  competitionId: string;
  answerId?: string | null;
  parentId?: string | null;
  onSuccess?: () => void;
  compact?: boolean;
}

export function CommentForm({
  questionId,
  competitionId,
  answerId,
  parentId,
  onSuccess,
  compact,
}: CommentFormProps) {
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!body.trim()) return;
    startTransition(async () => {
      await addCommentAction({
        questionId,
        competitionId,
        answerId: answerId ?? null,
        parentId: parentId ?? null,
        body: body.trim(),
      });
      setBody("");
      onSuccess?.();
    });
  }

  return (
    <div className="flex gap-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={compact ? "写一条评论…" : "添加评论（支持 Markdown）"}
        rows={compact ? 1 : 2}
        className={compact ? "min-h-8 resize-none text-sm" : "resize-none text-sm"}
      />
      <Button
        size={compact ? "sm" : "default"}
        onClick={handleSubmit}
        disabled={isPending || !body.trim()}
      >
        {isPending ? "发送中…" : "评论"}
      </Button>
    </div>
  );
}
