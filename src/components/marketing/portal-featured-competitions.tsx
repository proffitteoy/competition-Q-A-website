import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CompetitionCard } from "@/components/competitions/competition-card";
import { FadeInOnScroll } from "@/components/motion/fade-in-on-scroll";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { StaggerChildren } from "@/components/motion/stagger-children";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Competition } from "@/lib/mock-data";

import { Section } from "./section";

interface PortalFeaturedCompetitionsProps {
  competitions: Competition[];
}

export function PortalFeaturedCompetitions({
  competitions,
}: PortalFeaturedCompetitionsProps) {
  return (
    <Section id="featured-competitions" className="pt-0">
      <div className="mx-auto max-w-7xl space-y-8">
        <FadeInOnScroll direction="up">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs font-semibold tracking-[0.28em] text-slate-500 uppercase">
                重点赛事
              </p>
              <h2
                className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"
                style={{
                  fontFamily:
                    '"Noto Serif SC","Source Han Serif SC","Songti SC","STSong",serif',
                }}
              >
                优先把近期可参与的比赛摆到用户第一视线
              </h2>
              <p className="text-base leading-7 text-slate-600">
                首页重点承接正在报名、即将开始和进行中的比赛，学生进入后不需要先理解系统结构，先找到能参加什么。
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-slate-300 bg-white/80 text-slate-900 hover:bg-slate-50"
            >
              <Link href="/competitions">
                查看全部比赛
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </FadeInOnScroll>

        {competitions.length > 0 ? (
          <StaggerChildren className="grid gap-5 xl:grid-cols-3" staggerDelay={0.12}>
            {competitions.map((competition) => (
              <SpotlightCard key={competition.id} className="rounded-xl">
                <CompetitionCard competition={competition} />
              </SpotlightCard>
            ))}
          </StaggerChildren>
        ) : (
          <FadeInOnScroll>
            <Card className="border-dashed border-slate-300 bg-white/80">
              <CardContent className="space-y-3 p-8 text-center">
                <p className="text-lg font-semibold text-slate-900">当前暂无可展示赛事</p>
                <p className="text-sm leading-6 text-slate-600">
                  比赛发布后会自动按状态进入首页重点赛事区。
                </p>
              </CardContent>
            </Card>
          </FadeInOnScroll>
        )}
      </div>
    </Section>
  );
}
