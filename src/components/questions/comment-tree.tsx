"use client";

import { useState } from "react";

import { MarkdownContent } from "./markdown-content";
import { CommentForm } from "./comment-form";

interface Comment {
  id: string;
  parentId: string | null;
  depth: number;
  authorName: string;
  body: string;
  createdAt: string;
}

interface CommentTreeProps {
  comments: Comment[];
  questionId: string;
  competitionId: string;
  answerId?: string | null;
  isLoggedIn?: boolean;
}

function buildTree(comments: Comment[]) {
  const map = new Map<string | null, Comment[]>();
  for (const c of comments) {
    const key = c.parentId ?? null;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  }
  return map;
}

function CommentNode({
  comment,
  childrenMap,
  questionId,
  competitionId,
  answerId,
  isLoggedIn,
}: {
  comment: Comment;
  childrenMap: Map<string | null, Comment[]>;
  questionId: string;
  competitionId: string;
  answerId?: string | null;
  isLoggedIn?: boolean;
}) {
  const [showReply, setShowReply] = useState(false);
  const children = childrenMap.get(comment.id) ?? [];
  const maxIndent = 4;
  const indent = Math.min(comment.depth, maxIndent);

  const timeLabel = new Date(comment.createdAt).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });

  return (
    <div style={{ marginLeft: `${indent * 24}px` }}>
      <div className="border-l-2 border-border/50 py-2 pl-3">
        <p className="text-xs text-muted-foreground">
          {comment.authorName} · {timeLabel}
        </p>
        <div className="mt-1 text-sm">
          <MarkdownContent content={comment.body} className="prose-xs" />
        </div>
        {isLoggedIn && (
          <button
            type="button"
            onClick={() => setShowReply(!showReply)}
            className="mt-1 text-xs text-muted-foreground hover:text-primary"
          >
            {showReply ? "取消回复" : "回复"}
          </button>
        )}
        {showReply && (
          <div className="mt-2">
            <CommentForm
              questionId={questionId}
              competitionId={competitionId}
              answerId={answerId}
              parentId={comment.id}
              onSuccess={() => setShowReply(false)}
              compact
            />
          </div>
        )}
      </div>
      {children.map((child) => (
        <CommentNode
          key={child.id}
          comment={child}
          childrenMap={childrenMap}
          questionId={questionId}
          competitionId={competitionId}
          answerId={answerId}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  );
}

export function CommentTree({
  comments,
  questionId,
  competitionId,
  answerId,
  isLoggedIn,
}: CommentTreeProps) {
  const childrenMap = buildTree(comments);
  const roots = childrenMap.get(null) ?? [];

  if (roots.length === 0 && !isLoggedIn) return null;

  return (
    <div className="space-y-1">
      {roots.map((root) => (
        <CommentNode
          key={root.id}
          comment={root}
          childrenMap={childrenMap}
          questionId={questionId}
          competitionId={competitionId}
          answerId={answerId}
          isLoggedIn={isLoggedIn}
        />
      ))}
      {isLoggedIn && (
        <div className="pt-2">
          <CommentForm
            questionId={questionId}
            competitionId={competitionId}
            answerId={answerId}
            compact
          />
        </div>
      )}
    </div>
  );
}
