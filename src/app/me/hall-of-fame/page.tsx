import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function MyHallOfFamePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="个人中心"
        title="名人堂展示"
        description="查看入选状态、公开页预览与展示设置"
      />
      <EmptyState
        title="名人堂展示功能即将上线"
        description="后续版本将支持查看名人堂入选状态和管理公开展示信息，敬请期待。"
      />
    </div>
  );
}
