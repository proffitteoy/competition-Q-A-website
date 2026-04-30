import Link from "next/link";
import { ArrowRight, Download, Files, FolderOpenDot } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HomepageResourceRecord } from "@/server/repositories/homepage-repository";

import { Section } from "./section";

interface PortalResourceBoardProps {
  resources: HomepageResourceRecord[];
}

export function PortalResourceBoard({ resources }: PortalResourceBoardProps) {
  return (
    <Section id="resource-library" className="pt-0">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <Card className="overflow-hidden border-slate-200/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(30,41,59,0.96))] text-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.7)]">
          <CardHeader className="space-y-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-amber-200">
              <FolderOpenDot className="size-5" />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-[0.28em] text-slate-300 uppercase">
                资料与指南
              </p>
              <CardTitle
                className="text-3xl leading-10"
                style={{
                  fontFamily:
                    '"Noto Serif SC","Source Han Serif SC","Songti SC","STSong",serif',
                }}
              >
                把报名模板、赛事说明和历届材料汇总到一个入口
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm leading-7 text-slate-200">
              首页资料区优先提供学生最常找的文档入口。如果当前资料还没有公开下载地址，就直接回到对应比赛详情页查看说明和附件。
            </p>
            <Button
              asChild
              variant="secondary"
              className="bg-white text-slate-950 hover:bg-slate-100"
            >
              <Link href="/competitions">
                查看全部比赛资料
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {resources.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {resources.map((resource) => (
              <Card
                key={resource.id}
                className="border-slate-200/70 bg-white/92 shadow-[0_16px_45px_-30px_rgba(15,23,42,0.32)]"
              >
                <CardContent className="flex h-full flex-col gap-5 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100"
                    >
                      {resource.typeLabel}
                    </Badge>
                    {resource.downloadHref ? (
                      <Download className="size-4 text-amber-700" />
                    ) : (
                      <Files className="size-4 text-slate-400" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold leading-7 text-slate-950">
                      {resource.title}
                    </h3>
                    <p className="text-sm font-medium text-slate-500">
                      {resource.competitionTitle}
                    </p>
                  </div>
                  <p className="flex-1 text-sm leading-6 text-slate-600">
                    {resource.competitionSummary}
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="justify-between border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                  >
                    <Link href={resource.href}>
                      {resource.actionLabel}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-slate-300 bg-white/86 md:col-span-2">
            <CardContent className="space-y-3 p-8 text-center">
              <p className="text-lg font-semibold text-slate-900">当前暂无可公开资料</p>
              <p className="text-sm leading-6 text-slate-600">
                后台发布可见附件后，首页资料区会自动同步展示。
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Section>
  );
}
