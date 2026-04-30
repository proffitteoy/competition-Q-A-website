"use client";

import { useMemo, useState } from "react";

import { CompetitionCard } from "@/components/competitions/competition-card";
import { CompetitionFilterBar } from "@/components/competitions/competition-filter-bar";
import { PortalFooter } from "@/components/marketing/portal-footer";
import { PortalNavbar } from "@/components/marketing/portal-navbar";
import { Section } from "@/components/marketing/section";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  competitions,
  type CompetitionStatus,
} from "@/lib/mock-data";

export default function CompetitionsPage() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<CompetitionStatus | "all">("all");

  const filteredCompetitions = useMemo(() => {
    return competitions.filter((competition) => {
      const matchesKeyword =
        !keyword ||
        competition.title.includes(keyword) ||
        competition.category.includes(keyword) ||
        competition.department.includes(keyword);
      const matchesStatus = status === "all" || competition.status === status;
      return matchesKeyword && matchesStatus;
    });
  }, [keyword, status]);

  return (
    <div className="min-h-screen bg-background">
      <PortalNavbar />
      <Section className="pb-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <PageHeader
            eyebrow="Competitions"
            title="比赛列表"
            description="按报名状态、分类和归属学院快速浏览比赛入口，后续这里会接真实搜索、分页和状态统计。"
          />
          <CompetitionFilterBar
            keyword={keyword}
            status={status}
            onKeywordChange={setKeyword}
            onStatusChange={setStatus}
          />
          {filteredCompetitions.length ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredCompetitions.map((competition) => (
                <CompetitionCard key={competition.id} competition={competition} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="没有匹配的比赛"
              description="可以尝试切换状态筛选或更换关键词，后续这里会接入更细的分页与空状态引导。"
            />
          )}
        </div>
      </Section>
      <PortalFooter />
    </div>
  );
}
