import { PageHeader } from "@/components/shared/page-header";

export default function AdminScheduleLoading() {
  return (
    <div className="px-4 lg:px-6">
      <div className="space-y-8">
        <PageHeader
          eyebrow="赛程安排"
          title="赛程安排"
          description="第一阶段先用时间线占位，后续若引入 FullCalendar，再扩展到完整日历视图。"
        />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border border-border/70 bg-muted/40"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
