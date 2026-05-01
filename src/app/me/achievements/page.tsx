import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function MyAchievementsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="个人中心"
        title="我的成果"
        description="管理竞赛成果、获奖信息与经验文章"
      />
      <EmptyState
        title="我的成果功能即将上线"
        description="后续版本将支持管理竞赛成果和撰写经验文章，敬请期待。"
      />
    </div>
  );
}
