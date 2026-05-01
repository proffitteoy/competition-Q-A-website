"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExperienceReviewDialog } from "@/components/admin/experience-review-dialog";

interface ExperiencePost {
  id: string;
  userId: string;
  title: string;
  competitionTitle: string | null;
  awardLevel: string | null;
  status: string;
  updatedAt: string;
}

const statusLabels: Record<string, string> = {
  draft: "草稿",
  pending_review: "待审核",
  published: "已发布",
  offline: "已下线",
};

const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary",
  pending_review: "default",
  published: "outline",
  offline: "destructive",
};

export default function AdminExperienceReviewsPage() {
  const [posts, setPosts] = useState<ExperiencePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending_review");
  const [reviewTarget, setReviewTarget] = useState<ExperiencePost | null>(null);

  async function fetchPosts(status: string) {
    setLoading(true);
    try {
      const params = status !== "all" ? `?status=${status}` : "";
      const res = await fetch(`/api/admin/experience-posts${params}`);
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      setPosts(data);
    } catch {
      toast.error("获取文章列表失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts(statusFilter);
  }, [statusFilter]);

  async function handleReview(
    action: "approve" | "reject" | "offline",
    comment: string,
  ) {
    if (!reviewTarget) return;
    try {
      const res = await fetch(
        `/api/admin/experience-posts/${reviewTarget.id}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, comment: comment || undefined }),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "操作失败" }));
        throw new Error(err.message);
      }
      toast.success(
        action === "approve"
          ? "已通过"
          : action === "reject"
            ? "已驳回"
            : "已下线",
      );
      setReviewTarget(null);
      fetchPosts(statusFilter);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失败");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader eyebrow="后台管理" title="经验文章审核" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending_review">待审核</SelectItem>
            <SelectItem value="published">已发布</SelectItem>
            <SelectItem value="draft">草稿</SelectItem>
            <SelectItem value="offline">已下线</SelectItem>
            <SelectItem value="all">全部</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">加载中…</p>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            暂无文章
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{post.title}</span>
                    <Badge variant={statusVariants[post.status] ?? "secondary"}>
                      {statusLabels[post.status] ?? post.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {post.competitionTitle ?? "无关联竞赛"}
                    {post.awardLevel ? ` · ${post.awardLevel}` : ""}
                    {" · "}
                    {new Date(post.updatedAt).toLocaleDateString("zh-CN")}
                  </p>
                </div>
                {(post.status === "pending_review" ||
                  post.status === "published") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReviewTarget(post)}
                  >
                    {post.status === "pending_review" ? "审核" : "管理"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ExperienceReviewDialog
        open={!!reviewTarget}
        onOpenChange={(open) => {
          if (!open) setReviewTarget(null);
        }}
        postTitle={reviewTarget?.title ?? ""}
        postStatus={reviewTarget?.status ?? ""}
        onAction={handleReview}
      />
    </div>
  );
}
