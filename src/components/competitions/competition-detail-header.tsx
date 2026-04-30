import Link from "next/link";
import { CalendarRange, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Competition } from "@/lib/mock-data";

import { CompetitionStatusBadge } from "./competition-status-badge";

interface CompetitionDetailHeaderProps {
  competition: Competition;
}

export function CompetitionDetailHeader({
  competition,
}: CompetitionDetailHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,rgba(17,24,39,0.04),rgba(183,140,64,0.08))] p-6 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <CompetitionStatusBadge status={competition.status} />
            <span className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              {competition.category}
            </span>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {competition.title}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              {competition.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/competitions/${competition.id}/apply`}>立即报名</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/competitions">返回比赛列表</Link>
            </Button>
          </div>
        </div>
        <Card className="border-border/70 bg-background/85">
          <CardContent className="grid gap-4 p-6 text-sm">
            <div className="flex items-start gap-3">
              <CalendarRange className="mt-0.5 size-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">报名时间</p>
                <p className="text-muted-foreground">{competition.registrationWindow}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 size-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">参赛方式</p>
                <p className="text-muted-foreground">
                  {competition.registrationMode === "team" ? "团队报名" : "个人报名"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">地点与归属</p>
                <p className="text-muted-foreground">
                  {competition.department} · {competition.location}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
