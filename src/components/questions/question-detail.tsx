import { Pin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MarkdownContent } from "./markdown-content";

interface QuestionDetailProps {
  title: string;
  body: string;
  authorName: string;
  status: string;
  isPinned: boolean;
  createdAt: string;
}

export function QuestionDetail({
  title,
  body,
  authorName,
  status,
  isPinned,
  createdAt,
}: QuestionDetailProps) {
  const timeLabel = new Date(createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {isPinned && <Pin className="size-4 text-primary" />}
          <h1 className="text-xl font-semibold">{title}</h1>
          {status === "closed" && (
            <Badge variant="secondary">已关闭</Badge>
          )}
          {status === "hidden" && (
            <Badge variant="destructive">已隐藏</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {authorName} · {timeLabel}
        </p>
      </div>
      <MarkdownContent content={body} />
    </div>
  );
}
