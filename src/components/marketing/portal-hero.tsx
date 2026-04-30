import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Trophy, Users } from "lucide-react";

import { CompetitionCard } from "@/components/competitions/competition-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { platformStats, type Competition } from "@/lib/mock-data";

import { Section } from "./section";

interface PortalHeroProps {
  featuredCompetitions: Competition[];
}

export function PortalHero({ featuredCompetitions }: PortalHeroProps) {
  return (
    <Section className="relative overflow-hidden pb-10 pt-10 sm:pt-14">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,_rgba(209,175,109,0.28),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(35,74,129,0.16),_transparent_32%)]" />
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
            <span className="inline-flex size-2 rounded-full bg-emerald-500" />
            当前优先落地：竞赛门户、报名链路、审核工作台
          </div>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              学院竞赛从
              <span className="mx-3 text-primary">发布</span>
              到
              <span className="mx-3 text-primary">审核</span>
              的统一工作台
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              首页不是空泛宣传页，后台也不是传统教务系统。这个骨架先把比赛发现、报名提交、管理员审核和资料沉淀四条线织成一个完整闭环。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/competitions">
                立即查看比赛
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/admin">进入管理工作台</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Calendar,
                label: "统一日程与通知",
              },
              {
                icon: Users,
                label: "支持个人与团队报名",
              },
              {
                icon: BookOpen,
                label: "沉淀 FAQ 与资料下载",
              },
            ].map((item) => (
              <Card key={item.label} className="border-border/70 bg-background/80">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </div>
                  <p className="text-sm font-medium leading-6">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                Featured Flow
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                当前报名与进行中的重点比赛
              </h2>
            </div>
            <Trophy className="hidden size-6 text-primary sm:block" />
          </div>
          <div className="space-y-4">
            {featuredCompetitions.slice(0, 2).map((competition) => (
              <CompetitionCard key={competition.id} competition={competition} compact />
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {platformStats.slice(0, 2).map((stat) => (
              <Card key={stat.label} className="border-border/70 bg-card/80">
                <CardContent className="space-y-2 p-5">
                  <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
