import Link from "next/link";

export function PortalFooter() {
  return (
    <footer className="border-t border-slate-200/70 bg-[linear-gradient(180deg,#faf8f2_0%,#f5f1e8_100%)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.5fr_1fr_1fr] md:px-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
            学院竞赛门户
          </p>
          <h3
            className="text-2xl font-semibold tracking-tight text-slate-950"
            style={{
              fontFamily:
                '"Noto Serif SC","Source Han Serif SC","Songti SC","STSong",serif',
            }}
          >
            学院竞赛管理与问答平台
          </h3>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            首页聚焦比赛发现、通知获取、资料查看与报名进度查询。后台审核、导出与配置能力继续保留在管理台，不在前台门面上混杂展示。
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-950">平台入口</h4>
          <div className="flex flex-col gap-2 text-sm text-slate-600">
            <Link href="/competitions">比赛列表</Link>
            <Link href="/#latest-notices">通知公告</Link>
            <Link href="/#resource-library">报名资料</Link>
            <Link href="/me/applications">我的报名</Link>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-950">联系与说明</h4>
          <div className="flex flex-col gap-2 text-sm text-slate-600">
            <span>学院竞赛办公室</span>
            <span>邮箱：contest@college.example</span>
            <span>工作日 09:00 - 17:30</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
