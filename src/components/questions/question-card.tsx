import Link from "next/link";
import { MessageSquare, Pin } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface QuestionCardProps {
  id: string;
  competitionId: string;
  title: string;
  authorName: string;
  answerCount: number;
  isPinned: boolean;
  status: string;
  createdAt: string;
}

export function QuestionCard({
  id,
  competitionId,
  title,
  authorName,
  answerCount,
  isPinned,
  status,
  createdAt,
}: QuestionCardProps) {
  const timeLabel = new Date(createdAt).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/competitions/${competitionId}/questions/${id}`}
      className="group block rounded-xl border border-border/70 px-5 py-4 transition-colors hover:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            {isPinned && (
              <Pin className="size-3.5 shrink-0 text-primary" />
            )}
            <h3 className="truncate font-medium group-hover:text-primary">
              {title}
            </h3>
            {status === "closed" && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                已关闭
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {authorName} · {timeLabel}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <MessageSquare className="size-3.5" />
          <span>{answerCount}</span>
        </div>
      </div>
    </Link>
  );
}
