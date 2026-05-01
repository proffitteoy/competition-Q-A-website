import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CalendarRange,
  FileText,
  MapPin,
  Trophy,
} from "lucide-react";

import { CompetitionStatusBadge } from "@/components/competitions/competition-status-badge";
import { FadeInOnScroll } from "@/components/motion/fade-in-on-scroll";
import { StaggerChildren } from "@/components/motion/stagger-children";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Competition, UserRole } from "@/lib/mock-data";

import { Section } from "./section";

interface PortalHeroProps {
  featuredCompetitions: Competition[];
  currentUser:
    | {
        name: string;
        role: UserRole;
      }
    | null;
}

function canAccessAdmin(role: UserRole) {
  return role === "super_admin" || role === "competition_admin" || role === "content_editor";
}

export function PortalHero({ featuredCompetitions, currentUser }: PortalHeroProps) {
  const [primaryCompetition, ...secondaryCompetitions] = featuredCompetitions;
  const secondaryCards = secondaryCompetitions.slice(0, 2);
  const secondaryActionHref = currentUser ? "/me/applications" : "/#resource-library";
  const secondaryActionLabel = currentUser ? "查看我的报名" : "查看报名指南";

  return (
    <Section className="relative overflow-hidden pb-12 pt-8 sm:pt-12">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#f7f3ea_0%,#fcfbf8_42%,#f8f5ef_100%)]" />
      <div className="absolute inset-0 -z-[15] dot-grid-bg opacity-40" aria-hidden />
      <div className="absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(circle_at_top_left,rgba(180,83,9,0.22),transparent_36%),radial-gradient(circle_at_78%_16%,rgba(15,23,42,0.12),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,255,255,0))]" />
      <div className="absolute inset-x-4 top-6 -z-10 mx-auto h-[32rem] max-w-7xl rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),rgba(255,255,255,0.08))] shadow-[0_30px_90px_-70px_rgba(15,23,42,0.55)]" />

      {/* Floating orbs */}
      <div
        className="absolute -left-32 top-16 -z-[12] size-72 rounded-full bg-[radial-gradient(circle,rgba(180,83,9,0.12),transparent_70%)] blur-2xl animate-float-orb"
        aria-hidden
      />
      <div
        className="absolute -right-24 top-48 -z-[12] size-60 rounded-full bg-[radial-gradient(circle,rgba(62,99,221,0.1),transparent_70%)] blur-2xl animate-float-orb"
        style={{ animationDelay: "-3s" }}
        aria-hidden
      />

      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <FadeInOnScroll direction="up" duration={0.7}>
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/82 px-4 py-2 text-sm text-slate-600 shadow-sm">
              <span className="inline-flex size-2 rounded-full bg-emerald-500" />
              学院竞赛官方门户
            </div>
            <div className="space-y-6">
              <h1
                className="max-w-4xl text-5xl font-semibold leading-[1.06] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl"
                style={{
                  fontFamily:
                    '"Noto Serif SC","Source Han Serif SC","Songti SC","STSong",serif',
                }}
              >
                把学院竞赛的
                <span className="mx-3 text-amber-700">报名</span>
                入口、
                <span className="mx-3 text-slate-700">通知</span>
                与资料收回到同一张门面上
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                首页首先服务学生和教师完成真实任务：找比赛、看公告、下材料、查报名。后台审核逻辑继续留在后台，前台首页只保留清晰可信的门户表达。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                asChild
                className="bg-slate-950 text-white shadow-[0_18px_45px_-24px_rgba(15,23,42,0.7)] hover:bg-slate-800"
              >
                <Link href="/competitions">
                  查看全部比赛
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-slate-300 bg-white/80 text-slate-900 hover:bg-slate-50"
              >
                <Link href={secondaryActionHref}>{secondaryActionLabel}</Link>
              </Button>
              {currentUser && canAccessAdmin(currentUser.role) ? (
                <Button
                  size="lg"
                  variant="ghost"
                  asChild
                  className="text-slate-700 hover:bg-white/65 hover:text-slate-950"
                >
                  <Link href="/admin">进入管理台</Link>
                </Button>
              ) : null}
            </div>
            <StaggerChildren className="grid gap-4 sm:grid-cols-3" staggerDelay={0.12}>
              {[
                {
                  icon: BellRing,
                  label: "公告回到比赛详情统一查看",
                },
                {
                  icon: FileText,
                  label: "报名资料与 FAQ 集中收拢",
                },
                {
                  icon: Trophy,
                  label: "首页优先展示近期重点赛事",
                },
              ].map((item) => (
                <Card
                  key={item.label}
                  className="border-white/80 bg-white/76 shadow-[0_16px_44px_-30px_rgba(15,23,42,0.38)] backdrop-blur"
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(15,23,42,0.08),rgba(180,83,9,0.15))] text-slate-800">
                      <item.icon className="size-5" />
                    </div>
                    <p className="text-sm font-medium leading-6 text-slate-700">
                      {item.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </StaggerChildren>
          </div>
        </FadeInOnScroll>

        <FadeInOnScroll direction="up" delay={0.2} duration={0.7}>
          <div className="space-y-4 lg:pt-4">
            <Card className="overflow-hidden border-white/75 bg-white/88 shadow-[0_24px_70px_-34px_rgba(15,23,42,0.48)] backdrop-blur">
              <CardContent className="space-y-6 p-6 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                      本周重点赛事
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      首屏直接给出当前可优先关注的比赛
                    </h2>
                  </div>
                  <Trophy className="hidden size-6 text-amber-700 sm:block" />
                </div>

                {primaryCompetition ? (
                  <div className="space-y-5 rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,252,247,1),rgba(255,255,255,0.96))] p-5 shadow-[0_16px_44px_-28px_rgba(15,23,42,0.32)]">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-500">
                          {primaryCompetition.category}
                        </p>
                        <h3 className="text-2xl font-semibold leading-9 text-slate-950">
                          {primaryCompetition.title}
                        </h3>
                      </div>
                      <CompetitionStatusBadge status={primaryCompetition.status} />
                    </div>
                    <p className="text-sm leading-7 text-slate-600">
                      {primaryCompetition.summary}
                    </p>
                    <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <div className="flex items-start gap-3">
                          <CalendarRange className="mt-0.5 size-4 text-amber-700" />
                          <div>
                            <p className="font-medium text-slate-950">报名时间</p>
                            <p>{primaryCompetition.registrationWindow}</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-0.5 size-4 text-amber-700" />
                          <div>
                            <p className="font-medium text-slate-950">组织单位</p>
                            <p>{primaryCompetition.department}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="w-full bg-slate-950 text-white hover:bg-slate-800"
                    >
                      <Link href={`/competitions/${primaryCompetition.id}`}>
                        前往比赛详情
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-8 text-center">
                    <p className="text-lg font-semibold text-slate-900">当前暂无重点赛事</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      比赛发布后会自动进入首页重点展示区。
                    </p>
                  </div>
                )}

                {secondaryCards.length > 0 ? (
                  <div className="grid gap-3">
                    {secondaryCards.map((competition) => (
                      <Link
                        key={competition.id}
                        href={`/competitions/${competition.id}`}
                        className="group flex items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200/80 bg-white px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-950">
                            {competition.title}
                          </p>
                          <p className="text-sm text-slate-500">
                            {competition.registrationWindow}
                          </p>
                        </div>
                        <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700" />
                      </Link>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </FadeInOnScroll>
      </div>
    </Section>
  );
}
