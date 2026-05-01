import { MarkdownContent } from "./markdown-content";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface AnswerCardProps {
  id: string;
  authorName: string;
  body: string;
  isAccepted: boolean;
  createdAt: string;
  canAccept?: boolean;
  onAccept?: (answerId: string) => void;
}

export function AnswerCard({
  id,
  authorName,
  body,
  isAccepted,
  createdAt,
  canAccept,
  onAccept,
}: AnswerCardProps) {
  const timeLabel = new Date(createdAt).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={`rounded-xl border px-5 py-4 ${
        isAccepted
          ? "border-green-500/40 bg-green-50/50 dark:bg-green-950/20"
          : "border-border/70"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {authorName} · {timeLabel}
        </p>
        <div className="flex items-center gap-2">
          {isAccepted && (
            <Badge variant="outline" className="border-green-500/40 text-green-600">
              <Check className="mr-1 size-3" />
              已采纳
            </Badge>
          )}
          {canAccept && !isAccepted && onAccept && (
            <button
              type="button"
              onClick={() => onAccept(id)}
              className="text-xs text-muted-foreground hover:text-primary"
            >
              采纳此回答
            </button>
          )}
        </div>
      </div>
      <MarkdownContent content={body} />
    </div>
  );
}
