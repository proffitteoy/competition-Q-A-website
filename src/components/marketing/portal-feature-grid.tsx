import { FolderKanban, MessageSquareMore, ShieldCheck, Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Section } from "./section";

const features = [
  {
    icon: Trophy,
    title: "竞赛门户聚合",
    description: "比赛介绍、时间安排、FAQ、附件和相关问答统一收拢在比赛详情页，不再分散到群公告和零碎文档。",
  },
  {
    icon: FolderKanban,
    title: "报名与审核闭环",
    description: "按比赛配置报名表，支持个人与团队报名，限制重复提交，并在后台完成审核、批量处理和导出。",
  },
  {
    icon: MessageSquareMore,
    title: "问答沉淀后置但预留",
    description: "第一阶段先把问答位点和比赛关联结构留好，后续再补提问、回答、评论与采纳机制。",
  },
  {
    icon: ShieldCheck,
    title: "角色与作用域",
    description: "按全站管理员、比赛管理员、内容编辑、学生用户区分职责，避免比赛级越权操作。",
  },
];

export function PortalFeatureGrid() {
  return (
    <Section className="pt-0">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            What The Skeleton Fixes
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            不再先堆后台演示页，而是先把平台的业务链路搭对
          </h2>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            这一版骨架不是用来证明模板能跑，而是用来固定产品结构、信息层级和业务组件边界。
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/70 bg-background/80">
              <CardHeader className="space-y-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <feature.icon className="size-6" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
