import Link from "next/link";
import { ArrowUpRight, CalendarRange, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Competition } from "@/lib/mock-data";

import { CompetitionStatusBadge } from "./competition-status-badge";

interface CompetitionCardProps {
  competition: Competition;
  compact?: boolean;
}

export function CompetitionCard({
  competition,
  compact = false,
}: CompetitionCardProps) {
  return (
    <Card className="group overflow-hidden border-border/60 bg-card transition-colors duration-150 hover:border-border">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              {competition.category}
            </div>
            <CardTitle className={compact ? "text-xl leading-8" : "text-2xl leading-8"}>
              {competition.title}
            </CardTitle>
          </div>
          <CompetitionStatusBadge status={competition.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-7 text-muted-foreground">
          {competition.summary}
        </p>
        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <CalendarRange className="mt-0.5 size-4 text-primary" />
            <div>
              <p className="font-medium text-foreground">报名时间</p>
              <p>{competition.registrationWindow}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="mt-0.5 size-4 text-primary" />
            <div>
              <p className="font-medium text-foreground">报名方式</p>
              <p>{competition.registrationMode === "team" ? "团队报名" : "个人报名"}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60">
        <div className="text-sm text-muted-foreground">
          {competition.department} · {competition.location}
        </div>
        <Button asChild size="sm">
          <Link href={`/competitions/${competition.id}`}>
            查看详情
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
