import { getSessionUser } from "@/lib/auth/session";
import { isDatabaseConfigured } from "@/lib/db/config";
import {
  listMyExperiencePosts,
  type ExperiencePostRow,
} from "@/server/repositories/experience-post-repository";
import { PageHeader } from "@/components/shared/page-header";
import { ExperiencePostList } from "@/components/profile/experience-post-list";
import { EmptyState } from "@/components/shared/empty-state";

export default async function MyAchievementsPage() {
  const sessionUser = await getSessionUser();
  const userId = sessionUser.id!;

  if (!isDatabaseConfigured()) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="个人中心"
          title="我的成果"
          description="管理竞赛成果、获奖信息与经验文章"
        />
        <EmptyState
          title="数据库未配置"
          description="经验文章功能需要数据库支持，请联系管理员配置。"
        />
      </div>
    );
  }

  let posts: ExperiencePostRow[] = [];
  try {
    posts = await listMyExperiencePosts(userId);
  } catch {
    // table may not exist yet if migration hasn't run
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="个人中心"
        title="我的成果"
        description="管理竞赛成果、获奖信息与经验文章"
      />
      <ExperiencePostList posts={posts} />
    </div>
  );
}
