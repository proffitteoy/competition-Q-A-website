import Link from "next/link";

export function PortalFooter() {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.5fr_1fr_1fr] md:px-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            College Competition Platform
          </p>
          <h3 className="text-2xl font-semibold tracking-tight">学院竞赛管理与问答平台</h3>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            统一承接比赛发布、咨询、报名、审核、导出与资料沉淀，先把业务闭环做完整，再扩展社区化能力。
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">平台入口</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link href="/competitions">比赛列表</Link>
            <Link href="/me/applications">我的报名</Link>
            <Link href="/admin">管理工作台</Link>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">联系与说明</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>学院竞赛办公室</span>
            <span>邮箱：contest@college.example</span>
            <span>工作日 09:00 - 17:30</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
