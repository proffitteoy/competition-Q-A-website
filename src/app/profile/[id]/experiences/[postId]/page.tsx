import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award, Calendar } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { sanitizeHtml } from "@/lib/sanitize";
import { getPublishedExperiencePost } from "@/server/repositories/profile-repository";

interface ExperiencePostPageProps {
  params: Promise<{ id: string; postId: string }>;
}

export default async function ExperiencePostPage({
  params,
}: ExperiencePostPageProps) {
  const { id, postId } = await params;
  const post = await getPublishedExperiencePost(id, postId);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Link
        href={`/profile/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        返回个人主页
      </Link>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-950">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-600">{post.userName}</span>
          {post.awardLevel && (
            <Badge
              variant="secondary"
              className="rounded-full bg-amber-50 text-amber-800 hover:bg-amber-50"
            >
              <Award className="mr-1 size-3" />
              {post.awardLevel}
            </Badge>
          )}
          {post.competitionTitle && (
            <span className="text-sm text-slate-500">
              {post.competitionTitle}
            </span>
          )}
          {post.publishedAt && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <Calendar className="size-3" />
              {post.publishedAt}
            </span>
          )}
        </div>
      </div>

      <Card className="border-slate-200/70 bg-white/92 shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div
            className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-7"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
