import Link from "next/link";
import { ArrowRight, BellRing } from "lucide-react";

import { FadeInOnScroll } from "@/components/motion/fade-in-on-scroll";
import { StaggerChildren } from "@/components/motion/stagger-children";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublishedNoticeRecord } from "@/server/repositories/notice-repository";

import { Section } from "./section";

interface PortalNoticeBoardProps {
  notices: PublishedNoticeRecord[];
}

function buildNoticeExcerpt(content: string) {
  const normalized = content
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) {
    return "公告详情已同步到对应比赛页，可前往查看完整安排、阶段要求与附件说明。";
  }
  return normalized.length > 88 ? `${normalized.slice(0, 88)}...` : normalized;
}

export function PortalNoticeBoard({ notices }: PortalNoticeBoardProps) {
  const [featuredNotice, ...secondaryNotices] = notices;

  return (
    <Section id="latest-notices" className="pt-0">
      <div className="mx-auto max-w-7xl space-y-8">
        <FadeInOnScroll direction="up">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs font-semibold tracking-[0.28em] text-slate-500 uppercase">
                通知公告
              </p>
              <h2
                className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"
                style={{
                  fontFamily:
                    '"Noto Serif SC","Source Han Serif SC","Songti SC","STSong",serif',
                }}
              >
                近期安排和规则变化，应该在首页就能看到
              </h2>
              <p className="text-base leading-7 text-slate-600">
                公告区只承接已发布通知，入口回到对应比赛详情页，避免首页和比赛页各说一套。
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-slate-300 bg-white/80 text-slate-900 hover:bg-slate-50"
            >
              <Link href="/competitions">
                按比赛查看通知
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </FadeInOnScroll>

        {featuredNotice ? (
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <FadeInOnScroll direction="left" delay={0.1}>
              <Card className="overflow-hidden border-slate-200/70 bg-[linear-gradient(160deg,rgba(255,252,245,0.96),rgba(255,255,255,0.96))] shadow-[0_18px_50px_-30px_rgba(15,23,42,0.38)]">
                <CardHeader className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <Badge className="rounded-full bg-amber-100 px-3 py-1 text-amber-900 hover:bg-amber-100">
                      最新发布
                    </Badge>
                    <span className="text-sm font-medium text-slate-500">
                      {featuredNotice.updatedAt}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-500">
                      {featuredNotice.competitionTitle}
                    </p>
                    <CardTitle className="text-2xl leading-9 text-slate-950 sm:text-3xl">
                      {featuredNotice.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-base leading-8 text-slate-600">
                    {buildNoticeExcerpt(featuredNotice.content)}
                  </p>
                  <Button asChild className="bg-slate-950 text-white hover:bg-slate-800">
                    <Link href={featuredNotice.href}>
                      前往比赛详情
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </FadeInOnScroll>

            <StaggerChildren className="grid gap-4" staggerDelay={0.1}>
              {secondaryNotices.map((notice) => (
                <Link key={notice.id} href={notice.href} className="group block">
                  <Card className="h-full border-slate-200/70 bg-white/92 transition duration-300 hover:border-slate-300 hover:shadow-[0_18px_50px_-28px_rgba(15,23,42,0.28)]">
                    <CardContent className="flex h-full flex-col gap-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <BellRing className="mt-1 size-4 text-amber-700" />
                        <span className="text-sm text-slate-500">{notice.updatedAt}</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500">
                          {notice.competitionTitle}
                        </p>
                        <h3 className="text-lg font-semibold leading-7 text-slate-950 transition group-hover:text-slate-700">
                          {notice.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-6 text-slate-600">
                        {buildNoticeExcerpt(notice.content)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </StaggerChildren>
          </div>
        ) : (
          <FadeInOnScroll>
            <Card className="border-dashed border-slate-300 bg-white/80">
              <CardContent className="space-y-3 p-8 text-center">
                <p className="text-lg font-semibold text-slate-900">当前暂无已发布公告</p>
                <p className="text-sm leading-6 text-slate-600">
                  比赛通知发布后会优先出现在这里，学生可再进入对应比赛详情查看完整内容。
                </p>
              </CardContent>
            </Card>
          </FadeInOnScroll>
        )}
      </div>
    </Section>
  );
}
