"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Send, Undo2, CloudOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ExperiencePostRow } from "@/server/repositories/experience-post-repository";

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  draft: { label: "草稿", variant: "secondary" },
  pending_review: { label: "待审核", variant: "default" },
  published: { label: "已发布", variant: "outline" },
  offline: { label: "已下线", variant: "destructive" },
};

interface ExperiencePostListProps {
  posts: ExperiencePostRow[];
}

export function ExperiencePostList({ posts }: ExperiencePostListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(
    postId: string,
    action: "submit" | "withdraw" | "offline" | "delete",
  ) {
    setLoading(postId);
    try {
      const url =
        action === "delete"
          ? `/api/me/experience-posts/${postId}`
          : `/api/me/experience-posts/${postId}/${action}`;
      const method = action === "delete" ? "DELETE" : "POST";
      const res = await fetch(url, { method });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "操作失败" }));
        throw new Error(err.message);
      }
      toast.success(
        action === "submit"
          ? "已提交审核"
          : action === "withdraw"
            ? "已撤回"
            : action === "offline"
              ? "已下线"
              : "已删除",
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失败");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">经验文章</h2>
        <Button size="sm" asChild>
          <Link href="/me/achievements/new">
            <Plus className="mr-1 size-4" />
            新建文章
          </Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card className="border-dashed border-slate-300 bg-white/86">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-slate-500">
              暂无经验文章，点击上方按钮开始撰写。
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const cfg = statusConfig[post.status] ?? statusConfig.draft;
            const isLoading = loading === post.id;
            return (
              <Card
                key={post.id}
                className="border-slate-200/70 bg-white/92"
              >
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {post.title}
                      </h3>
                      <Badge variant={cfg.variant} className="shrink-0 text-xs">
                        {cfg.label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                      {post.competitionTitle && (
                        <span>{post.competitionTitle}</span>
                      )}
                      {post.awardLevel && <span>{post.awardLevel}</span>}
                      <span>
                        更新于{" "}
                        {new Date(post.updatedAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                    {post.reviewComment && post.status === "draft" && (
                      <p className="text-xs text-red-500">
                        审核意见：{post.reviewComment}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {(post.status === "draft" ||
                      post.status === "offline") && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/me/achievements/${post.id}/edit`}>
                            <Pencil className="mr-1 size-3.5" />
                            编辑
                          </Link>
                        </Button>
                        {post.status === "draft" && (
                          <Button
                            size="sm"
                            disabled={isLoading}
                            onClick={() => handleAction(post.id, "submit")}
                          >
                            <Send className="mr-1 size-3.5" />
                            提交审核
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isLoading}
                          onClick={() => handleAction(post.id, "delete")}
                        >
                          <Trash2 className="mr-1 size-3.5" />
                          删除
                        </Button>
                      </>
                    )}
                    {post.status === "pending_review" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleAction(post.id, "withdraw")}
                      >
                        <Undo2 className="mr-1 size-3.5" />
                        撤回
                      </Button>
                    )}
                    {post.status === "published" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => handleAction(post.id, "offline")}
                      >
                        <CloudOff className="mr-1 size-3.5" />
                        下线
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
